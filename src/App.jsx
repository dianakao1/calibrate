import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';

/* ============================================================
   CALIBRATE — GRE / GMAT practice instrument
   Design direction: editorial instrument. Warm gallery paper,
   Fraunces serif display over Plex Mono data, soft geometry,
   layered depth, one cobalt signal color.
   ============================================================ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,450..700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

.cal *, .cal *::before, .cal *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
.cal {
  --paper:#F4F1E9; --card:#FFFFFF; --ink:#1E1B16; --muted:#6C6557;
  --rule:#E0DACA; --rule-soft:#EAE5D8; --edge:#B5AC97;
  --blue:#2B4ACB; --blue-dk:#20348C; --blue-wash:#EDF0FC;
  --ok:#177054; --ok-wash:#E4F1EA;
  --flag:#C23E22; --flag-wash:#FAEAE3;
  --amber:#95660A;
  --mono:'IBM Plex Mono',ui-monospace,Menlo,monospace;
  --sans:'IBM Plex Sans',system-ui,-apple-system,sans-serif;
  --cond:'Fraunces',Georgia,'Times New Roman',serif;
  --shadow-1:0 1px 2px rgba(30,27,22,.06), 0 1px 1px rgba(30,27,22,.03);
  --shadow-2:0 2px 4px rgba(30,27,22,.05), 0 14px 34px -10px rgba(30,27,22,.16);
  --bar:74px;
  background:
    radial-gradient(1100px 420px at 85% -160px, rgba(43,74,203,.07), transparent 65%),
    var(--paper);
  color:var(--ink); font-family:var(--sans);
  min-height:100vh; font-size:16px; line-height:1.55;
  -webkit-font-smoothing:antialiased; text-size-adjust:100%;
}
.cal button { font:inherit; color:inherit; cursor:pointer; }
.cal :focus-visible { outline:2px solid var(--blue); outline-offset:2px; }

/* ---- structure: mobile first ---- */
.wrap { max-width:760px; margin:0 auto; padding:0 14px calc(var(--bar) + 30px); }
.wrap.plain { padding-bottom:40px; }
.rail { border-bottom:1px solid var(--rule); background:rgba(255,255,255,.86);
  -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px);
  position:sticky; top:0; z-index:20; }
.rail-in {
  max-width:760px; margin:0 auto; padding:12px 14px;
  display:flex; align-items:center; gap:10px;
  font-family:var(--mono); font-size:10.5px; letter-spacing:.08em; text-transform:uppercase;
  color:var(--muted);
}
.mark { font-family:var(--cond); font-weight:650; font-size:20px; letter-spacing:-.01em;
  color:var(--ink); text-transform:none; }
.mark::before { content:''; display:inline-block; width:9px; height:9px; border-radius:50%;
  background:var(--blue); margin-right:9px; vertical-align:2px; }
.spacer { flex:1; }

.lbl { font-family:var(--mono); font-size:10.5px; letter-spacing:.13em;
  text-transform:uppercase; color:var(--muted); }
.h1 { font-family:var(--cond); font-weight:600; font-size:32px; line-height:1.06;
  letter-spacing:-.015em; margin:26px 0 6px; }
.h1::before { content:''; display:block; width:30px; height:4px; border-radius:2px;
  background:var(--blue); margin-bottom:16px; }
.h2 { font-family:var(--cond); font-weight:600; font-size:20px; letter-spacing:-.005em; margin:0 0 10px; }
.sub { color:var(--muted); font-size:14.5px; margin:0 0 22px; max-width:60ch; }

.card { background:var(--card); border:1px solid var(--rule); border-radius:14px;
  box-shadow:var(--shadow-1); overflow:hidden; }
.pad { padding:16px; }
.hr { height:1px; background:var(--rule-soft); border:0; margin:0; }

/* ---- exam tag ---- */
.tag { font-family:var(--mono); font-size:10px; font-weight:600; letter-spacing:.12em;
  text-transform:uppercase; padding:3px 9px; border-radius:999px; color:#fff; background:var(--blue); }
.tag[data-e="GMAT"] { background:#6D3F8E; }

/* ---- SIGNATURE: calibration scale ---- */
.gauge { padding:16px 16px 13px; }
.gauge + .gauge { border-top:1px solid var(--rule-soft); }
.gauge-head { display:flex; align-items:baseline; gap:10px; margin-bottom:16px; }
.gauge-name { font-family:var(--cond); font-weight:600; font-size:17px; letter-spacing:0; }
.gauge-val { font-family:var(--mono); font-weight:600; font-size:25px; margin-left:auto;
  line-height:1; font-variant-numeric:tabular-nums; }
.scale { position:relative; height:46px; margin-top:2px; }
.scale-axis { position:absolute; left:0; right:0; top:16px; height:1px; background:var(--rule); }
.tick { position:absolute; top:12px; width:1px; height:5px; background:var(--rule); }
.tick.major { top:9px; height:8px; background:var(--edge); }
.tick-num { position:absolute; top:22px; transform:translateX(-50%);
  font-family:var(--mono); font-size:9.5px; color:var(--muted); }
.band { position:absolute; top:10px; height:13px; border-radius:7px;
  background:linear-gradient(90deg, var(--blue-wash), #D8DFFA);
  box-shadow:inset 0 0 0 1px rgba(43,74,203,.4); border-left:0; border-right:0; }
.needle { position:absolute; top:4px; width:2px; height:25px; background:var(--blue-dk); border-radius:1px; }
.needle::after { content:''; position:absolute; top:-5px; left:-3px;
  border-left:4px solid transparent; border-right:4px solid transparent;
  border-top:5px solid var(--blue-dk); }
.goal { position:absolute; top:6px; height:21px; width:0; border-left:2px dashed var(--flag); }
.goal-lbl { position:absolute; top:-14px; transform:translateX(-50%); white-space:nowrap;
  font-family:var(--mono); font-size:9.5px; letter-spacing:.08em; color:var(--flag); text-transform:uppercase; }
.goal[data-edge="1"] .goal-lbl { transform:translateX(calc(-100% + 2px)); }
.gauge-note { font-family:var(--mono); font-size:10.5px; line-height:1.5; color:var(--muted); margin-top:4px; }

/* ---- buttons ---- */
/* NOTE: .cal button below sets color:inherit at specificity (0,1,1).
   Any single-class button rule (0,1,0) loses to it, which previously
   rendered solid buttons as dark-on-dark. Component button classes are
   scoped with .cal to outrank it. */
.cal .btn {
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  background:var(--ink); color:#fff; border:1px solid var(--ink); border-radius:999px;
  padding:0 22px; min-height:48px; font-family:var(--mono); font-size:12px; letter-spacing:.09em;
  text-transform:uppercase; font-weight:500; text-align:center;
  box-shadow:var(--shadow-1);
  transition:opacity .12s, transform .15s, box-shadow .15s, background .15s;
}
.cal .btn:active { opacity:.8; transform:translateY(0); }
.cal .btn:disabled { opacity:.35; cursor:not-allowed; box-shadow:none; }
.cal .btn.ghost { background:var(--card); color:var(--ink); border-color:var(--edge); }
.cal .btn.grow { flex:1; }
.cal .mode, .cal .opt, .cal .blank-o, .cal .tagopt, .cal .blocker { color:var(--ink); }

/* ---- fixed action bar (thumb zone) ---- */
.actionbar {
  position:fixed; left:0; right:0; bottom:0; z-index:30;
  background:rgba(255,255,255,.92);
  -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px);
  border-top:1px solid var(--rule);
  padding:11px 14px calc(11px + env(safe-area-inset-bottom));
  box-shadow:0 -8px 24px rgba(30,27,22,.06);
}
.actionbar-in { max-width:760px; margin:0 auto; display:flex; gap:9px; align-items:center; }
.keys { display:none; font-family:var(--mono); font-size:10px; color:var(--muted); }
.kbd { border:1px solid var(--rule); border-radius:5px; padding:1px 5px; background:var(--paper); }

/* ---- mode list ---- */
.modes { display:grid; grid-template-columns:1fr; gap:10px; }
.mode { text-align:left; background:var(--card); border:1px solid var(--rule); border-radius:14px;
  padding:15px 16px; box-shadow:var(--shadow-1);
  transition:border-color .15s, box-shadow .15s, transform .15s; }
.mode:active { border-color:var(--ink); }
.mode:disabled { opacity:.4; cursor:not-allowed; }
.mode-k { font-family:var(--mono); font-size:10px; letter-spacing:.13em; color:var(--blue); text-transform:uppercase; }
.mode-t { font-family:var(--cond); font-weight:600; font-size:19px; margin:6px 0 3px; letter-spacing:-.005em; }
.mode-d { font-size:13.5px; color:var(--muted); line-height:1.45; }

/* ---- segmented ---- */
.seg { display:inline-flex; border:1px solid var(--edge); border-radius:999px; overflow:hidden; background:var(--card); }
.seg button { background:transparent; border:0; padding:0 16px; min-height:40px;
  font-family:var(--mono); font-size:11.5px; letter-spacing:.09em; text-transform:uppercase; color:var(--muted);
  transition:background .15s, color .15s; }
.seg button + button { border-left:1px solid var(--rule); }
.seg button[data-on="1"] { background:var(--ink); color:#fff; }

/* ---- question ---- */
.qmeta { display:flex; align-items:center; gap:9px; flex-wrap:wrap;
  font-family:var(--mono); font-size:10.5px; letter-spacing:.09em; text-transform:uppercase;
  color:var(--muted); padding:12px 16px; border-bottom:1px solid var(--rule-soft); }
.diff { display:inline-flex; gap:3px; }
.diff i { width:6px; height:6px; border-radius:50%; background:var(--rule); display:block; }
.diff i[data-on="1"] { background:var(--blue); }
.pacewrap { display:flex; align-items:center; gap:9px; width:100%; }
.pace { flex:1; height:4px; border-radius:2px; background:var(--rule-soft); position:relative; overflow:hidden; }
.pace span { position:absolute; inset:0 auto 0 0; border-radius:2px; background:var(--ok); transition:width .9s linear; }
.pace[data-over="1"] span { background:var(--flag); }

.ptabs { display:flex; border:1px solid var(--rule); border-radius:999px; overflow:hidden; margin-bottom:14px; background:var(--card); }
.ptabs button { flex:1; background:transparent; border:0; min-height:40px;
  font-family:var(--mono); font-size:11px; letter-spacing:.09em; text-transform:uppercase; color:var(--muted); }
.ptabs button + button { border-left:1px solid var(--rule); }
.ptabs button[data-on="1"] { background:var(--ink); color:#fff; }

.passage { background:#FBF9F3; border:1px solid var(--rule-soft); border-left:3px solid var(--blue);
  border-radius:0 12px 12px 0; padding:15px 16px;
  margin:0 0 16px; font-size:15px; line-height:1.68; }
.stem { font-size:16px; line-height:1.6; margin:0 0 16px; }

.qc-grid { display:grid; grid-template-columns:1fr; border:1px solid var(--rule);
  border-radius:12px; overflow:hidden; margin-bottom:16px; background:var(--card); }
.qc-cell { padding:13px 15px; }
.qc-cell + .qc-cell { border-top:1px solid var(--rule); }
.qc-lbl { font-family:var(--mono); font-size:10px; letter-spacing:.12em; color:var(--muted);
  text-transform:uppercase; margin-bottom:5px; }
.qc-val { font-family:var(--mono); font-size:16px; }

.tblwrap { overflow-x:auto; margin-bottom:16px; -webkit-overflow-scrolling:touch; }
.tbl { width:100%; min-width:340px; border-collapse:collapse; font-family:var(--mono); font-size:12.5px; }
.tbl caption { text-align:left; font-family:var(--mono); font-size:10.5px; letter-spacing:.1em;
  text-transform:uppercase; color:var(--muted); padding-bottom:6px; }
.tbl th, .tbl td { border:1px solid var(--rule); padding:7px 10px; text-align:right; white-space:nowrap; }
.tbl th:first-child, .tbl td:first-child { text-align:left; }
.tbl thead th { background:#F6F3EA; font-weight:600; }

.opts { display:flex; flex-direction:column; gap:9px; }
.opt { display:flex; gap:11px; align-items:flex-start; text-align:left; width:100%;
  background:var(--card); border:1px solid var(--rule); border-radius:12px;
  padding:13px 14px; min-height:50px; font-size:15px; line-height:1.45; box-shadow:var(--shadow-1);
  transition:border-color .15s, box-shadow .15s, transform .15s, background .15s; }
.opt:active:not(:disabled) { border-color:var(--ink); }
.opt:disabled { cursor:default; }
.opt-k { font-family:var(--mono); font-size:11.5px; color:var(--muted); flex:0 0 auto;
  border:1px solid var(--edge); width:24px; height:24px; display:grid; place-items:center;
  border-radius:50%; margin-top:0; transition:background .15s, color .15s, border-color .15s; }
.opt[data-sel="1"] { border-color:var(--ink); box-shadow:0 0 0 1px var(--ink), var(--shadow-1); }
.opt[data-sel="1"] .opt-k { background:var(--ink); color:#fff; border-color:var(--ink); }
.opt[data-state="ok"] { border-color:var(--ok); background:var(--ok-wash); box-shadow:none; }
.opt[data-state="ok"] .opt-k { background:var(--ok); color:#fff; border-color:var(--ok); }
.opt[data-state="bad"] { border-color:var(--flag); background:var(--flag-wash); box-shadow:none; }
.opt[data-state="bad"] .opt-k { background:var(--flag); color:#fff; border-color:var(--flag); }

.blanks { display:grid; gap:10px; grid-template-columns:1fr; margin-bottom:4px; }
.blank-col { border:1px solid var(--rule); border-radius:12px; overflow:hidden; box-shadow:var(--shadow-1); }
.blank-h { font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase;
  color:var(--muted); padding:8px 13px; background:#F6F3EA; border-bottom:1px solid var(--rule); }
.blank-o { display:block; width:100%; text-align:left; background:var(--card); border:0;
  border-bottom:1px solid var(--rule-soft); padding:13px; min-height:48px; font-size:15px;
  transition:background .15s, color .15s; }
.blank-o:last-child { border-bottom:0; }
.blank-o[data-sel="1"] { background:var(--ink); color:#fff; }
.blank-o[data-state="ok"] { background:var(--ok-wash); box-shadow:inset 3px 0 0 var(--ok); }
.blank-o[data-state="bad"] { background:var(--flag-wash); box-shadow:inset 3px 0 0 var(--flag); }

.ne-in { font-family:var(--mono); font-size:18px; padding:13px; width:100%; max-width:220px;
  min-height:50px; border:2px solid var(--edge); border-radius:12px; background:var(--card); color:var(--ink); }

.verdict { display:flex; align-items:center; gap:9px; flex-wrap:wrap; font-family:var(--mono);
  font-size:11.5px; letter-spacing:.1em; text-transform:uppercase; font-weight:500; margin-bottom:11px; }
.verdict[data-v="ok"] { color:var(--ok); }
.verdict[data-v="bad"] { color:var(--flag); }
.dot { width:9px; height:9px; border-radius:50%; background:currentColor; }
.expl { font-size:15px; line-height:1.65; }
.expl p { margin:0 0 9px; }
.take { margin-top:12px; padding:12px 14px; background:#FBF6E7; border:1px solid #EBDDB4;
  border-left:3px solid var(--amber); border-radius:0 10px 10px 0;
  font-size:14px; line-height:1.5; }
.take b { font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase;
  color:var(--amber); display:block; margin-bottom:4px; font-weight:600; }

/* ---- stats ---- */
.statrow { display:grid; grid-template-columns:1fr 1fr; }
.stat { padding:15px 16px; border-right:1px solid var(--rule-soft); }
.stat:nth-child(2n) { border-right:0; }
.stat:nth-child(-n+2) { border-bottom:1px solid var(--rule-soft); }
.stat-n { font-family:var(--cond); font-size:26px; font-weight:600; line-height:1.1; font-variant-numeric:tabular-nums; }
.stat-l { font-family:var(--mono); font-size:9.5px; letter-spacing:.1em; text-transform:uppercase;
  color:var(--muted); margin-top:4px; }

.bars { display:flex; flex-direction:column; }
.bar-row { display:grid; grid-template-columns:1fr 74px 54px; gap:10px; align-items:center;
  padding:11px 16px; border-bottom:1px solid var(--rule-soft); font-size:14px; }
.bar-row:last-child { border-bottom:0; }
.bar { height:7px; border-radius:4px; background:var(--rule-soft); position:relative; overflow:hidden; }
.bar span { position:absolute; inset:0 auto 0 0; border-radius:4px; background:var(--blue); }
.bar[data-weak="1"] span { background:var(--flag); }
.bar-n { font-family:var(--mono); font-size:11.5px; color:var(--muted); text-align:right; font-variant-numeric:tabular-nums; }


.lesson { border:1px solid #C9D2F3; border-radius:14px; background:var(--blue-wash); padding:15px; }
.lesson-in { border:0; border-radius:0; background:transparent; padding:15px 16px 17px; }
.lesson-h { font-family:var(--mono); font-size:10.5px; letter-spacing:.12em; text-transform:uppercase;
  color:var(--blue-dk); font-weight:600; margin-bottom:9px; }
.lesson-core { font-size:15px; line-height:1.6; margin:0 0 11px; font-weight:500; }
.lesson-list { margin:0 0 12px; padding-left:19px; }
.lesson-list li { font-size:14.5px; line-height:1.55; margin-bottom:6px; }
.lesson-eg, .lesson-trap { font-size:14px; line-height:1.55; padding:11px 13px; background:var(--card);
  border-left:3px solid var(--blue); border-radius:0 10px 10px 0; margin-bottom:8px; }
.lesson-trap { border-left-color:var(--flag); }
.lesson-eg b, .lesson-trap b { display:block; font-family:var(--mono); font-size:9.5px; letter-spacing:.12em;
  text-transform:uppercase; color:var(--muted); margin-bottom:3px; font-weight:600; }


.deeptoggle { display:block; width:100%; text-align:left; background:transparent; border:0;
  border-top:1px solid var(--rule); margin-top:12px; padding:11px 0 4px; min-height:44px;
  font-family:var(--mono); font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:var(--blue-dk); }
.deepbox { margin-top:4px; }
.deepitem { padding:11px 13px; background:var(--card); border-left:3px solid var(--blue-dk);
  border-radius:0 10px 10px 0; margin-bottom:8px; }
.deepitem b { display:block; font-size:14px; font-weight:600; margin-bottom:4px; line-height:1.4; }
.deepitem p { margin:0; font-size:14px; line-height:1.6; }



.qhead { font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase;
  color:var(--muted); font-weight:500; margin:0; }
.qhead:focus-visible { outline:3px solid var(--blue); outline-offset:3px; }
.examtop-warn { font-weight:700; }
.examtop { display:flex; align-items:center; gap:10px; color:#fff;
  background:linear-gradient(135deg, #26221B, var(--ink));
  padding:12px 16px; border-radius:12px; margin-top:14px; font-family:var(--mono);
  font-size:11px; letter-spacing:.09em; text-transform:uppercase; box-shadow:var(--shadow-2); }
.examtop[data-low="1"] { background:var(--flag); }
.examtop-l { font-weight:500; }
.examtop-c { font-size:19px; font-weight:600; letter-spacing:.04em; font-variant-numeric:tabular-nums; }
.flagbtn { background:none; border:1px solid var(--edge); border-radius:999px; padding:5px 11px;
  min-height:44px; font-family:var(--mono); font-size:10px; letter-spacing:.09em;
  text-transform:uppercase; color:var(--muted); }
.flagbtn[aria-pressed="true"] { background:var(--amber); color:#fff; border-color:var(--amber); }
.revgrid { display:grid; grid-template-columns:repeat(auto-fill,minmax(44px,1fr)); gap:7px; margin-top:12px; }
.revbox { min-height:44px; border:1px solid var(--edge); border-radius:9px; background:var(--card);
  font-family:var(--mono); font-size:13px; position:relative; }
.revbox[data-s="done"] { background:var(--ink); color:#fff; border-color:var(--ink); }
.revbox[data-s="ok"] { background:var(--ok-wash); border-color:var(--ok); color:var(--ok); font-weight:600; }
.revbox[data-s="bad"] { background:var(--flag-wash); border-color:var(--flag); color:var(--flag); font-weight:600; }
.revbox[data-s="blank"] { border-style:dashed; color:var(--muted); }
.revbox[data-flag="1"]::after { content:''; position:absolute; top:4px; right:4px; width:7px; height:7px;
  border-radius:50%; background:var(--amber); border:0; }
.deckpick { display:grid; grid-template-columns:1fr; gap:9px; }
.deckbtn { text-align:left; background:var(--card); border:1px solid var(--rule); border-radius:12px;
  padding:12px 15px; min-height:56px; box-shadow:var(--shadow-1);
  transition:border-color .15s, box-shadow .15s, transform .15s; }
.deckbtn[data-on="1"] { border-color:var(--ink); box-shadow:0 0 0 1px var(--ink), var(--shadow-1); padding:12px 15px; border-width:1px; }
.deckbtn-n { display:block; font-family:var(--cond); font-weight:600; font-size:17px; }
.deckbtn-s { display:block; font-family:var(--mono); font-size:11px; color:var(--muted); margin-top:3px; }
.fcard { background:var(--card); border:1px solid var(--rule); border-radius:18px; padding:24px 20px;
  box-shadow:var(--shadow-2); }
.fcard-k { display:flex; align-items:center; gap:8px; font-family:var(--mono); font-size:10px;
  letter-spacing:.12em; text-transform:uppercase; color:var(--muted); margin-bottom:14px; }
.fcard-badge { font-family:var(--mono); font-size:9px; letter-spacing:.1em; padding:2px 8px;
  border-radius:999px; background:var(--ok); color:#fff; }
.fcard-badge.due { background:var(--flag); }
.fcard-front { font-family:var(--cond); font-weight:600; font-size:34px; line-height:1.12; letter-spacing:-.01em; }
.fcard-back { margin-top:16px; border-top:1px solid var(--rule-soft); padding-top:14px; }
.fcard-def { font-size:17px; line-height:1.5; }
.fcard-note { margin-top:10px; padding:11px 13px; background:var(--blue-wash);
  border-left:3px solid var(--blue); border-radius:0 10px 10px 0; font-size:14.5px; line-height:1.55; font-style:italic; }
.ratebtns { display:grid; grid-template-columns:1fr; gap:9px; }
.ratebtn { text-align:left; background:var(--card); border:1px solid var(--rule); border-radius:12px;
  padding:12px 15px; min-height:56px; box-shadow:var(--shadow-1);
  transition:border-color .15s, box-shadow .15s, transform .15s; }
.ratebtn b { display:block; font-size:15px; font-weight:600; }
.ratebtn span { display:block; font-family:var(--mono); font-size:11px; color:var(--muted); margin-top:2px; }
.ratebtn[data-r="again"] { box-shadow:inset 3px 0 0 var(--flag), var(--shadow-1); }
.ratebtn[data-r="hard"] { box-shadow:inset 3px 0 0 var(--amber), var(--shadow-1); }
.ratebtn[data-r="good"] { box-shadow:inset 3px 0 0 var(--ok), var(--shadow-1); }
@media (min-width:700px) {
  .deckpick { grid-template-columns:repeat(3,1fr); }
  .ratebtns { grid-template-columns:repeat(3,1fr); }
  .fcard-front { font-size:42px; }
}
.fmt-top { display:grid; gap:12px; }
.fmt-v { font-size:14.5px; line-height:1.45; margin-top:2px; }
@media (min-width:700px) { .fmt-top { grid-template-columns:1fr 1fr; } }
.lessonrow { display:flex; align-items:center; gap:11px; width:100%; text-align:left;
  background:var(--card); border:0; border-bottom:1px solid var(--rule-soft);
  padding:14px 16px; min-height:52px; transition:background .15s; }
.lessonrow:active { background:var(--blue-wash); }
.lessonrow-t { flex:1; font-size:15px; }
.lessonrow-s { font-family:var(--mono); font-size:11px; color:var(--muted); }
.lessonrow-s[data-weak="1"] { color:var(--flag); font-weight:600; }
.lessonrow-c { font-family:var(--mono); font-size:16px; color:var(--blue); width:14px; text-align:center; }
.lessonbody { border-bottom:1px solid var(--rule-soft); background:#FBF9F3; }


.termwrap { position:relative; display:inline; }
.term { display:inline; background:none; border:0; padding:0; font:inherit; color:var(--blue-dk);
  border-bottom:1px dotted var(--blue-dk); text-align:left; }
.term-i { display:inline-grid; place-items:center; width:14px; height:14px; margin-left:3px;
  border-radius:50%; background:var(--blue-dk); color:#fff; font-size:9px; font-weight:700;
  vertical-align:1px; font-family:var(--mono); }
.termdef { display:block; margin:8px 0; padding:11px 13px; background:var(--blue-wash);
  border-left:3px solid var(--blue-dk); border-radius:0 10px 10px 0; font-size:14px; line-height:1.55; color:var(--ink); }
.termclose { display:block; margin-top:7px; background:none; border:0; padding:6px 0;
  font-family:var(--mono); font-size:10.5px; letter-spacing:.1em; text-transform:uppercase;
  color:var(--blue-dk); text-decoration:underline; min-height:32px; }

.helpbtn { width:28px; height:28px; border-radius:50%; border:1px solid var(--edge);
  background:var(--card); color:var(--blue-dk); font-family:var(--mono); font-size:12px;
  font-weight:600; display:grid; place-items:center; padding:0; box-shadow:var(--shadow-1); }

.guidewrap { position:fixed; inset:0; z-index:60; background:rgba(30,27,22,.5);
  -webkit-backdrop-filter:blur(3px); backdrop-filter:blur(3px);
  display:flex; align-items:flex-end; justify-content:center; padding:14px; }
.guide { background:var(--card); border-radius:20px; width:100%; max-width:460px; padding:22px 20px 16px;
  max-height:88vh; overflow-y:auto; box-shadow:var(--shadow-2); }
.guide-k { font-family:var(--mono); font-size:10px; letter-spacing:.13em; text-transform:uppercase;
  color:var(--blue); margin-bottom:8px; }
.guide-t { font-family:var(--cond); font-weight:600; font-size:24px; margin:0 0 9px; line-height:1.15; letter-spacing:-.01em; }
.guide-d { font-size:15px; line-height:1.6; margin:0 0 16px; }
.guide-dots { display:flex; gap:5px; margin-bottom:15px; }
.guide-dots i { width:20px; height:4px; border-radius:2px; background:var(--rule); display:block; }
.guide-dots i[data-on="1"] { background:var(--blue); }
.guide-btns { display:flex; gap:8px; }
.guide-skip { display:block; width:100%; background:none; border:0; margin-top:6px; padding:11px 0;
  min-height:44px; font-family:var(--mono); font-size:10.5px; letter-spacing:.1em;
  text-transform:uppercase; color:var(--muted); text-decoration:underline; }
@media (min-width:700px) { .guidewrap { align-items:center; } }
.sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden;
  clip:rect(0 0 0 0); white-space:nowrap; border:0; }
.skip { position:absolute; left:-9999px; top:0; z-index:100; background:var(--ink); color:#fff;
  padding:12px 16px; font-family:var(--mono); font-size:12px; border-radius:0 0 10px 0; }
.skip:focus { left:0; }
.cal :focus-visible { outline:3px solid var(--blue-dk); outline-offset:2px; }
.cal button:focus-visible { outline:3px solid var(--blue-dk); outline-offset:2px; }
.vsym { font-size:14px; line-height:1; }
.optmark { margin-left:auto; font-size:15px; font-weight:700; }
.opt[data-state="ok"] .optmark { color:var(--ok); }
.opt[data-state="bad"] .optmark { color:var(--flag); }
@media (forced-colors: active) {
  .cal .btn, .opt, .mode, .tagopt { border:1px solid ButtonBorder; }
  .opt[data-sel="1"] { outline:2px solid Highlight; }
}
.empty { padding:32px 16px; text-align:center; color:var(--muted); font-size:14.5px; }
.foot { display:flex; gap:9px; align-items:center; flex-wrap:wrap; margin-top:16px; }
[data-hide="1"] { display:none; }

.pill { font-family:var(--mono); font-size:10px; font-weight:600; letter-spacing:.1em;
  padding:3px 9px; border-radius:999px; background:var(--flag); color:#fff; }

.warnbar { background:#FBF6E7; border:1px solid #E5D6A8; border-radius:12px;
  padding:12px 14px; font-size:13.5px; line-height:1.5; margin-top:14px; }
.warnbar b { display:block; margin-bottom:2px; }

.verdict[data-v="slow"] { color:var(--amber); }
.pacewarn { background:#FBF6E7; border-left:3px solid var(--amber); border-radius:0 10px 10px 0;
  padding:11px 14px; font-size:14px; line-height:1.5; margin-bottom:14px; }

.tagger { border:1px solid var(--rule); border-radius:14px; padding:14px; margin-bottom:16px;
  background:#FBF9F3; }
.tagopts { display:grid; grid-template-columns:1fr; gap:8px; }
.tagopt { display:block; text-align:left; width:100%; background:var(--card);
  border:1px solid var(--rule); border-radius:10px; padding:11px 13px; min-height:48px;
  box-shadow:var(--shadow-1); transition:border-color .15s, box-shadow .15s; }
.tagopt:active { border-color:var(--ink); }
.tagopt b { display:block; font-size:14.5px; font-weight:600; }
.tagopt span { display:block; font-size:12.5px; color:var(--muted); line-height:1.4; margin-top:2px; }
.tagged { display:flex; align-items:center; gap:8px; font-size:14.5px; font-weight:600; }
.linkbtn { background:none; border:0; padding:4px 6px; font-family:var(--mono); font-size:10.5px;
  letter-spacing:.1em; text-transform:uppercase; color:var(--blue); text-decoration:underline; }

.blockers { display:flex; flex-direction:column; }
.blocker { display:flex; align-items:center; gap:13px; text-align:left; width:100%;
  background:var(--card); border:0; border-bottom:1px solid var(--rule-soft);
  padding:13px 16px; min-height:60px; transition:background .15s; }
.blocker:last-child { border-bottom:0; }
.blocker:active { background:var(--blue-wash); }
.blocker-n { font-family:var(--cond); font-size:24px; font-weight:600; min-width:38px;
  font-variant-numeric:tabular-nums; color:var(--blue-dk); }
.blocker-txt { flex:1; }
.blocker-txt b { display:block; font-size:14.5px; font-weight:500; line-height:1.35; }
.blocker-txt span { display:block; font-size:12.5px; color:var(--muted); margin-top:2px; line-height:1.35; }
.blocker-go { font-family:var(--mono); font-size:10px; letter-spacing:.1em; text-transform:uppercase;
  color:var(--blue); white-space:nowrap; }

.nav { display:flex; border:1px solid var(--edge); border-radius:999px; overflow:hidden;
  background:var(--card); margin-top:20px; box-shadow:var(--shadow-1); }
.nav button { flex:1; background:transparent; border:0; min-height:44px;
  font-family:var(--mono); font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:var(--muted);
  transition:background .15s, color .15s; }
.nav button + button { border-left:1px solid var(--rule); }
.nav button[data-on="1"] { background:var(--ink); color:#fff; }

/* ---- pointer hover (desktop) ---- */
@media (hover:hover) and (pointer:fine) {
  .cal .btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:var(--shadow-2); }
  .cal .btn.ghost:hover:not(:disabled) { border-color:var(--ink); }
  .mode:hover:not(:disabled), .deckbtn:hover, .ratebtn:hover, .tagopt:hover {
    border-color:var(--ink); transform:translateY(-1px); box-shadow:var(--shadow-2); }
  .opt:hover:not(:disabled) { border-color:var(--ink); }
  .blank-o:hover:not(:disabled):not([data-sel="1"]) { background:#FBF9F3; }
  .blocker:hover, .lessonrow:hover { background:var(--blue-wash); }
  .seg button:hover:not([data-on="1"]), .nav button:hover:not([data-on="1"]),
  .ptabs button:hover:not([data-on="1"]) { color:var(--ink); background:var(--rule-soft); }
  .revbox:hover { border-color:var(--ink); }
  .flagbtn:hover { border-color:var(--ink); color:var(--ink); }
  .term:hover { color:var(--blue); border-bottom-color:var(--blue); }
  .helpbtn:hover { border-color:var(--blue-dk); }
}

/* ---- wider screens ---- */
@media (min-width:700px) {
  .wrap { padding:0 20px 40px; }
  .h1 { font-size:38px; margin-top:30px; }
  .modes { grid-template-columns:1fr 1fr; }
  .statrow { grid-template-columns:repeat(4,1fr); }
  .stat { border-right:1px solid var(--rule-soft); border-bottom:0; }
  .stat:last-child { border-right:0; }
  .qc-grid { grid-template-columns:1fr 1fr; }
  .qc-cell + .qc-cell { border-top:0; border-left:1px solid var(--rule); }
  .blanks.multi { grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); }
  .bar-row { grid-template-columns:1fr 150px 62px; }
  .actionbar { position:static; border-top:0; padding:16px 0 0; background:transparent;
    -webkit-backdrop-filter:none; backdrop-filter:none; box-shadow:none; }
  .actionbar-in { padding:0; }
  .btn.grow { flex:0 0 auto; }
  .keys { display:inline; margin-left:auto; }
  .ptabs { display:none; }
  [data-hide="1"] { display:block; }
  .qmeta .pacewrap { width:auto; flex:1; min-width:150px; }
  .tagopts { grid-template-columns:1fr 1fr; }
}

/* ---- large screens: use the width instead of a phone column ---- */
@media (min-width:1000px) {
  .wrap { max-width:1000px; }
  .rail-in { max-width:1000px; }
  .actionbar-in { max-width:1000px; }
  .modes { grid-template-columns:repeat(3,1fr); }
  .h1 { font-size:44px; }
  /* reading comprehension side by side: passage stays visible while answering */
  .rcsplit { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:22px; align-items:start; }
  .rcsplit .passage { margin:0; position:sticky; top:70px; max-height:calc(100vh - 190px); overflow-y:auto; }
  .tagopts { grid-template-columns:repeat(3,1fr); }
  .revgrid { grid-template-columns:repeat(auto-fill,minmax(52px,1fr)); }
  .examtop { position:sticky; top:0; z-index:20; }
  .blanks.multi { grid-template-columns:repeat(3,1fr); }
}
@media (min-width:1280px) {
  .wrap, .rail-in, .actionbar-in { max-width:1120px; }
}
/* ---- landscape phones: the fixed bar eats too much height ---- */
@media (max-height:520px) and (orientation:landscape) {
  .actionbar { position:static; border-top:0; padding:14px 0 0; background:transparent;
    -webkit-backdrop-filter:none; backdrop-filter:none; box-shadow:none; }
  .wrap { padding-bottom:34px; }
  .guidewrap { align-items:flex-start; }
  .guide { max-height:96vh; }
}
/* ---- WCAG 1.4.10: must reflow at 400% zoom with no horizontal scroll ---- */
@media (max-width:400px) {
  .wrap { padding-left:11px; padding-right:11px; }
  .h1 { font-size:26px; }
  .fcard-front { font-size:28px; }
  .stem, .opt { font-size:15px; }
  .qmeta { gap:7px; font-size:9.5px; }
}
@media (prefers-reduced-motion:reduce) { .cal * { transition:none !important; animation:none !important; } }
`;

/* ============================================================
   REFERENCE MATERIAL
   ============================================================ */

const TABLES = {
  rev: {
    caption: 'Novara Industries — revenue by division ($ millions)',
    head: ['Division', '2021', '2022', '2023'],
    rows: [
      ['Aerospace', '120', '150', '165'],
      ['Software', '80', '110', '160'],
      ['Materials', '50', '45', '40'],
      ['Total', '250', '305', '365'],
    ],
  },
  ship: {
    caption: 'Fulfillment center — orders and on-time rate, Q1',
    head: ['Center', 'Orders', 'On-time %', 'Cost/order'],
    rows: [
      ['Reno', '48,000', '96', '$4.10'],
      ['Toledo', '61,000', '88', '$3.40'],
      ['Macon', '35,000', '92', '$4.80'],
    ],
  },
  grad: {
    caption: 'Engineering master\'s admissions, most recent cycle',
    head: ['Program', 'Applications', 'Admitted', 'Avg GRE Q'],
    rows: [
      ['Mechanical', '1,240', '310', '164'],
      ['Electrical', '1,860', '372', '166'],
      ['Civil', '720', '252', '161'],
      ['Industrial', '540', '189', '163'],
    ],
  },
};

const PASSAGES = {
  threads: `Before the 1860s, a bolt manufactured in one workshop was unlikely to fit a nut made in another. Each machinist cut threads to a private standard, so replacement parts had to be fabricated on site, often by the original maker. Joseph Whitworth's proposal for a uniform thread angle and pitch was therefore less a technical innovation than an administrative one: the geometry he specified was unremarkable, and rival forms performed comparably under load. What made Whitworth's system prevail was that Britain's railway companies, facing enormous maintenance costs, adopted it collectively and required their suppliers to comply. Historians who treat the standard as a triumph of engineering insight thus misread the episode. Its significance lies in demonstrating that a technology's diffusion may depend less on its intrinsic merits than on the market power of those who choose to demand it — a lesson that later contests over industrial standards would repeatedly confirm.`,
  coral: `Coral reefs are often described as the rainforests of the sea, a comparison meant to convey biological richness. The analogy is misleading in one important respect. Rainforest soils are typically nutrient-poor because the nutrients are locked in living biomass, but the surrounding water in a reef system is nutrient-poor in an absolute sense: the open ocean around most reefs is close to a biological desert. Reefs sustain their productivity through exceptionally tight internal recycling, in which symbiotic algae housed within coral tissue capture and return nutrients that would otherwise be lost to the water column. This dependence explains the system's fragility. A thermal stress event that expels the algae does not merely bleach the coral cosmetically; it severs the recycling loop on which the entire community depends. Recovery, when it occurs, is therefore governed less by the return of coral cover than by the reestablishment of that symbiosis.`,
  levee: `Levees reduce the frequency of flooding along a river, but they may increase the severity of the floods that do occur. By confining a river to a narrower channel, a levee raises the water's velocity and elevation during high flow, transferring risk downstream. More consequentially, the protection a levee appears to offer encourages settlement and capital investment in the floodplain behind it. When the structure is eventually overtopped or breached — an event that becomes less frequent but never impossible — the losses are far larger than they would have been had the land remained sparsely developed. Economists call this the safe development paradox, and it is not confined to flood control: seat belts, antibiotics, and deposit insurance have all been argued to produce analogous effects on behavior. The policy implication is not that protective measures should be abandoned. It is that their benefits must be assessed against the conduct they induce, and not merely against the hazard they directly reduce.`,
};

/* ============================================================
   QUESTION BANK
   ============================================================ */

const BANK = [
  /* ---------- GRE QUANTITATIVE COMPARISON ---------- */
  { id:'qc1', exam:'GRE', section:'Quant', type:'QC', topic:'Number properties', d:2,
    stem:'x is a negative integer.', qa:'x²', qb:'x³',
    answer:0,
    explain:'A negative number raised to an even power is positive; raised to an odd power it stays negative. So x² > 0 and x³ < 0 for every negative integer x. No exceptions exist in the allowed domain, so the relationship is fixed.',
    take:'On QC, "cannot be determined" is only right if you can actually produce two cases. Try to produce them before choosing D.' },
  { id:'qc2', exam:'GRE', section:'Quant', type:'QC', topic:'Algebra', d:2,
    stem:'0 < x < 1', qa:'x²', qb:'√x',
    answer:1,
    explain:'For a proper fraction, squaring shrinks it and taking a root grows it. Test x = 1/4: x² = 1/16, √x = 1/2. The ordering x² < x < √x holds across the whole open interval.',
    take:'Memorize the fraction ordering: for 0<x<1, x² < x < √x. It reverses for x > 1.' },
  { id:'qc3', exam:'GRE', section:'Quant', type:'QC', topic:'Exponents', d:3,
    stem:'', qa:'2³⁰', qb:'3²⁰',
    answer:1,
    explain:'Make the exponents match. 2³⁰ = (2³)¹⁰ = 8¹⁰ and 3²⁰ = (3²)¹⁰ = 9¹⁰. Same exponent, so compare bases: 9¹⁰ > 8¹⁰.',
    take:'When exponents differ, factor to a common exponent rather than a common base. GCF of the exponents is the target.' },
  { id:'qc4', exam:'GRE', section:'Quant', type:'QC', topic:'Arithmetic', d:3,
    stem:'x and y are positive integers and x + y = 10.', qa:'xy', qb:'24',
    answer:3,
    explain:'The product ranges from 1×9 = 9 up to 5×5 = 25. Since 9 < 24 and 25 > 24, both directions occur.',
    take:'For a fixed sum, the product is maximized when the values are equal and minimized at the extremes. Check both endpoints before answering.' },
  { id:'qc5', exam:'GRE', section:'Quant', type:'QC', topic:'Geometry', d:3,
    stem:'In triangle ABC, angle A = 40° and angle B = 60°.', qa:'The length of AB', qb:'The length of BC',
    answer:0,
    explain:'Angle C = 180 − 40 − 60 = 80°. Side AB is opposite angle C (80°); side BC is opposite angle A (40°). Larger angle faces the longer side, so AB > BC.',
    take:'Name the side by the angle across from it. In triangle ABC, side AB sits opposite angle C.' },
  { id:'qc6', exam:'GRE', section:'Quant', type:'QC', topic:'Statistics', d:3,
    stem:'', qa:'The standard deviation of {2, 4, 6, 8, 10}', qb:'The standard deviation of {12, 14, 16, 18, 20}',
    answer:2,
    explain:'The second set is the first shifted up by 10. Adding a constant to every element moves the mean by the same amount and leaves every deviation from the mean unchanged, so the standard deviation is identical.',
    take:'Shifting a data set never changes spread. Scaling it multiplies the standard deviation by the same factor.' },
  { id:'qc7', exam:'GRE', section:'Quant', type:'QC', topic:'Number properties', d:4,
    stem:'n is a positive integer.', qa:'The remainder when 7ⁿ is divided by 5', qb:'2',
    answer:3,
    explain:'The remainders cycle: 7¹ → 2, 7² = 49 → 4, 7³ = 343 → 3, 7⁴ → 1, then repeat. The remainder is 2 only when n ≡ 1 (mod 4), and is something else otherwise.',
    take:'For "remainder of aⁿ", compute the first four powers and look for the cycle. Cycles almost always close within 4 steps on this exam.' },
  { id:'qc8', exam:'GRE', section:'Quant', type:'QC', topic:'Arithmetic', d:2,
    stem:'', qa:'The number of distinct prime factors of 210', qb:'4',
    answer:2,
    explain:'210 = 2 × 3 × 5 × 7, which is exactly four distinct primes.',
    take:'"Distinct prime factors" ignores multiplicity: 8 = 2³ has one distinct prime factor, not three.' },

  { id:'qc9', exam:'GRE', section:'Quant', type:'QC', topic:'Algebra', d:3,
    stem:'n is an integer and n > 1.', qa:'n / (n + 1)', qb:'(n + 1) / (n + 2)',
    answer:1,
    explain:'Rewrite each as 1 minus a piece: n/(n+1) = 1 − 1/(n+1) and (n+1)/(n+2) = 1 − 1/(n+2). The larger denominator subtracts less, so Quantity B is larger for every allowed n. Test n = 2: 2/3 ≈ 0.667 vs 3/4 = 0.75.',
    take:'Fractions of the form n/(n+1) increase toward 1 as n grows. Rewriting as 1 − 1/(n+1) makes the comparison instant.' },
  { id:'qc10', exam:'GRE', section:'Quant', type:'QC', topic:'Geometry', d:3,
    stem:'A rectangle has a perimeter of 20.', qa:'The area of the rectangle', qb:'24',
    answer:3,
    explain:'Perimeter 20 means length plus width equals 10. Area can be as large as 5 × 5 = 25 or as small as you like (9 × 1 = 9). Both sides of 24 are reachable.',
    take:'Perimeter never fixes area. For a fixed perimeter, the square maximizes area and long thin rectangles minimize it.' },
  { id:'qc11', exam:'GRE', section:'Quant', type:'QC', topic:'Algebra', d:3,
    stem:'x < 0 < y', qa:'x − y', qb:'x + y',
    answer:1,
    explain:'Subtract x from both quantities — a legal move that preserves the inequality. You are left comparing −y with y. Since y is positive, −y < y, so Quantity B is greater.',
    take:'On QC you may add or subtract the same term from both sides freely. Cancelling the shared piece is usually faster than plugging numbers.' },
  { id:'qc12', exam:'GRE', section:'Quant', type:'QC', topic:'Statistics', d:2,
    stem:'The average (arithmetic mean) of 5 consecutive even integers is 20.', qa:'The largest of the 5 integers', qb:'24',
    answer:2,
    explain:'In an evenly spaced set with an odd number of terms, the mean is the middle term, so the set is 16, 18, 20, 22, 24. The largest is 24.',
    take:'Evenly spaced set, odd count: the mean sits exactly in the middle. Build outward from there rather than writing equations.' },
  { id:'qc13', exam:'GRE', section:'Quant', type:'QC', topic:'Percents', d:2,
    stem:'', qa:'0.2 percent of 500', qb:'1',
    answer:2,
    explain:'0.2% = 0.002. Then 0.002 × 500 = 1. The trap is reading 0.2% as 0.2, which would give 100.',
    take:'Convert a percent by moving the decimal two places left. 0.2% is two thousandths, not two tenths.' },
  { id:'qc14', exam:'GRE', section:'Quant', type:'QC', topic:'Probability', d:3,
    stem:'A fair coin is flipped 3 times.', qa:'The probability of exactly 2 heads', qb:'The probability of exactly 1 head',
    answer:2,
    explain:'There are 8 equally likely sequences. Exactly 2 heads occurs in 3 of them (HHT, HTH, THH) and exactly 1 head also occurs in 3 (HTT, THT, TTH). Both probabilities are 3/8.',
    take:'Binomial counts are symmetric for a fair coin: exactly k successes in n trials matches exactly n − k.' },
  { id:'qc15', exam:'GRE', section:'Quant', type:'QC', topic:'Coordinate geometry', d:2,
    stem:'Line k has slope −2 and passes through the point (0, 4).', qa:'The x-intercept of line k', qb:'2',
    answer:2,
    explain:'The line is y = −2x + 4. Setting y = 0 gives x = 2.',
    take:'A point with x = 0 hands you the y-intercept directly, so you can write slope-intercept form without any algebra.' },
  { id:'qc16', exam:'GRE', section:'Quant', type:'QC', topic:'Arithmetic', d:2,
    stem:'', qa:'The number of integers from −5 to 7, inclusive', qb:'12',
    answer:0,
    explain:'Count = last − first + 1 = 7 − (−5) + 1 = 13. Forgetting the +1 gives the trap value of 12.',
    take:'Inclusive counting always adds one. If both endpoints are counted, the gap between them is one less than the number of items.' },
  { id:'qc17', exam:'GRE', section:'Quant', type:'QC', topic:'Number properties', d:4,
    stem:'', qa:'The units digit of 3¹⁷', qb:'3',
    answer:2,
    explain:'Units digits of powers of 3 cycle in fours: 3, 9, 7, 1. Since 17 leaves remainder 1 when divided by 4, the units digit matches that of 3¹, which is 3.',
    take:'Divide the exponent by the cycle length and use the remainder. A remainder of 0 points to the last term of the cycle, not the first.' },
  { id:'qc18', exam:'GRE', section:'Quant', type:'QC', topic:'Statistics', d:5,
    stem:'A list of 5 numbers has a mean of 12 and a median of 15.', qa:'The largest number in the list', qb:'15',
    answer:3,
    explain:'The largest can equal 15: the list 7, 8, 15, 15, 15 has median 15 and sum 60, so mean 12. It can also exceed 15: 1, 2, 15, 21, 21 has median 15 and mean 12. Both cases are consistent.',
    take:'When mean and median disagree, sketch an extreme list on each side before choosing. D on QC requires two constructed examples, not just a hunch.' },

  { id:'qc19', exam:'GRE', section:'Quant', type:'QC', topic:'Algebra', d:5,
    stem:'x and y are positive numbers and x² = y³.', qa:'x', qb:'y',
    answer:3,
    explain:'If y = 1 then x = 1 and the quantities are equal. If y = 4 then x² = 64 and x = 8, so Quantity A is greater. Two cases exist, so nothing is determined.',
    take:'Whenever a QC allows 1 as a value, test it first. It is the most common source of an equality case that forces D.' },
  { id:'qc20', exam:'GRE', section:'Quant', type:'QC', topic:'Statistics', d:5,
    stem:'a and b are positive numbers and a > b.', qa:'(a + b) / 2', qb:'√(ab)',
    answer:0,
    explain:'This compares the arithmetic mean with the geometric mean. AM ≥ GM always holds for positive numbers, with equality only when the numbers are equal. Since a > b, the inequality is strict and Quantity A is greater.',
    take:'AM ≥ GM is worth memorizing outright. The equality case is exactly when all the values are identical.' },
  { id:'qc21', exam:'GRE', section:'Quant', type:'QC', topic:'Probability', d:5,
    stem:'A jar holds 5 red and 3 blue marbles. Two are drawn at random without replacement.',
    qa:'The probability that both are the same color', qb:'The probability that they are different colors',
    answer:1,
    explain:'Same color = (5/8)(4/7) + (3/8)(2/7) = 20/56 + 6/56 = 26/56. Different colors is the complement, 30/56. Quantity B is greater.',
    take:'Compute the smaller-looking case and subtract from 1. Two events that partition the sample space let you skip half the work.' },
  { id:'qc22', exam:'GRE', section:'Quant', type:'QC', topic:'Number properties', d:4,
    stem:'n is a positive integer.', qa:'The number of positive divisors of 2ⁿ', qb:'n + 1',
    answer:2,
    explain:'The divisors of 2ⁿ are exactly 2⁰, 2¹, …, 2ⁿ, which is n + 1 values. The divisor-count formula agrees: exponent n plus one.',
    take:'A prime power pᵏ has exactly k + 1 divisors. The "plus one" accounts for p⁰ = 1.' },
  { id:'qc23', exam:'GRE', section:'Quant', type:'QC', topic:'Coordinate geometry', d:5,
    stem:'In the xy-plane, line L passes through (2, 3) and has slope m, where m < 0.',
    qa:'The x-intercept of L', qb:'2',
    answer:0,
    explain:'Point-slope gives y − 3 = m(x − 2). Setting y = 0: x = 2 − 3/m. Since m is negative, −3/m is positive, so x exceeds 2 for every negative slope.',
    take:'A line through a point in the first quadrant with negative slope must cross the x-axis to the right of that point. Sketching beats algebra here.' },
  { id:'qc24', exam:'GRE', section:'Quant', type:'QC', topic:'Statistics', d:5,
    stem:'The value x is such that the median of the list 3, 7, x, 12, 15 equals the mean of that list.',
    qa:'x', qb:'8',
    answer:3,
    explain:'Three cases. If 7 ≤ x ≤ 12 the median is x, so x = (37 + x)/5 gives x = 9.25. If x < 7 the median is 7, giving x = −2. If x > 12 the median is 12, giving x = 23. All three are internally consistent, so x is not determined.',
    take:'When an unknown sits inside a list, the median depends on where it lands. Split into cases by position before writing any equation.' },
  { id:'qc25', exam:'GRE', section:'Quant', type:'QC', topic:'Number properties', d:5,
    stem:'p is a prime number greater than 3.', qa:'The remainder when p² is divided by 12', qb:'1',
    answer:2,
    explain:'Any prime above 3 is one more or one less than a multiple of 6, so p = 6k ± 1. Then p² = 36k² ± 12k + 1, and every term but the 1 is divisible by 12. The remainder is always 1. Check: 5² = 25 and 7² = 49 both leave remainder 1.',
    take:'Primes greater than 3 always take the form 6k ± 1. This single fact resolves most "prime remainder" questions.' },

  /* ---------- GRE PROBLEM SOLVING ---------- */
  { id:'ps1', exam:'GRE', section:'Quant', type:'PS', topic:'Algebra', d:1,
    stem:'If 3x − 7 = 14, what is the value of 6x + 1?',
    choices:['29','36','43','49','57'], answer:2,
    explain:'3x = 21, so x = 7. Then 6(7) + 1 = 43. Faster: 6x is twice 3x, so 6x = 42, and 42 + 1 = 43 — you never need x itself.',
    take:'Look for the target expression as a multiple of what you already have. Solving for the variable is often the slow path.' },
  { id:'ps2', exam:'GRE', section:'Quant', type:'PS', topic:'Percents', d:3,
    stem:'A rectangle\'s length is increased by 20% and its width is decreased by 20%. The area of the new rectangle is what percent of the original area?',
    choices:['96%','98%','100%','102%','104%'], answer:0,
    explain:'New area = (1.20L)(0.80W) = 0.96LW, which is 96% of the original — a 4% decrease. The offsetting percentages do not cancel because they apply to different bases.',
    take:'Successive percent changes multiply, never add. Up x% then down x% always loses (x/100)² of the original.' },
  { id:'ps3', exam:'GRE', section:'Quant', type:'PS', topic:'Rates', d:2,
    stem:'Machine A can complete a job in 6 hours and Machine B can complete the same job in 3 hours. Working together at their constant rates, how long will they take?',
    choices:['1 hour','1.5 hours','2 hours','2.5 hours','4.5 hours'], answer:2,
    explain:'Rates add: 1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2 job per hour. Time is the reciprocal: 2 hours.',
    take:'Add rates, not times. Then invert at the very end — inverting early is the most common error here.' },
  { id:'ps4', exam:'GRE', section:'Quant', type:'PS', topic:'Statistics', d:2,
    stem:'The average (arithmetic mean) of 5 numbers is 20. When one number is removed, the average of the remaining 4 numbers is 18. What was the number removed?',
    choices:['20','24','26','28','32'], answer:3,
    explain:'Total of 5 numbers = 5 × 20 = 100. Total of remaining 4 = 4 × 18 = 72. The removed value is 100 − 72 = 28.',
    take:'Convert every average into a sum immediately. Averages are almost never the useful form for the arithmetic.' },
  { id:'ps5', exam:'GRE', section:'Quant', type:'PS', topic:'Probability', d:3,
    stem:'A bag contains 4 red marbles and 6 blue marbles. If two marbles are drawn at random without replacement, what is the probability that both are red?',
    choices:['1/15','2/15','4/25','1/5','2/5'], answer:1,
    explain:'P(first red) = 4/10. Given that, P(second red) = 3/9. Multiply: (4/10)(3/9) = 12/90 = 2/15.',
    take:'"Without replacement" means both numerator and denominator drop by one. Writing 4/10 × 3/9 beats setting up combinations under time pressure.' },
  { id:'ps6', exam:'GRE', section:'Quant', type:'PS', topic:'Geometry', d:3,
    stem:'A circle is inscribed in a square with side length 8. What is the area of the region inside the square but outside the circle?',
    choices:['64 − 8π','64 − 16π','64 − 32π','32 − 16π','16π − 64'], answer:1,
    explain:'The inscribed circle has diameter equal to the side, so the radius is 4 and its area is 16π. The square\'s area is 64. The difference is 64 − 16π ≈ 13.7.',
    take:'Inscribed circle in a square: diameter = side. Circumscribed circle: diameter = diagonal = side·√2.' },
  { id:'ps7', exam:'GRE', section:'Quant', type:'PS', topic:'Rates', d:4,
    stem:'A car travels 60 miles at 30 miles per hour and returns along the same route at 60 miles per hour. What is its average speed for the entire trip?',
    choices:['36 mph','40 mph','45 mph','48 mph','50 mph'], answer:1,
    explain:'Total distance = 120 miles. Time out = 60/30 = 2 hours; time back = 60/60 = 1 hour; total 3 hours. Average speed = 120/3 = 40 mph, not the arithmetic mean of 45.',
    take:'Average speed is total distance over total time. The answer choice equal to the plain average of the two speeds is always the trap.' },
  { id:'ps8', exam:'GRE', section:'Quant', type:'PS', topic:'Percents', d:3,
    stem:'The price of a stock rises by 25% and then falls by 20%. Compared with its original price, the final price is:',
    choices:['5% lower','unchanged','5% higher','2% higher','10% lower'], answer:1,
    explain:'Multiply the factors: 1.25 × 0.80 = 1.00. The gain and the loss exactly offset because 20% of the larger amount equals 25% of the smaller one.',
    take:'A rise of 1/4 is undone by a fall of 1/5. In fraction form the reversal pairs become obvious: +1/n is undone by −1/(n+1).' },
  { id:'ps9', exam:'GRE', section:'Quant', type:'PS', topic:'Combinatorics', d:2,
    stem:'A committee of 3 people is to be selected from a group of 8. How many different committees are possible?',
    choices:['24','56','120','336','512'], answer:1,
    explain:'Order does not matter on a committee, so use combinations: 8!/(3!·5!) = (8·7·6)/(3·2·1) = 56. The value 336 is the permutation count, which double-counts each committee 6 times.',
    take:'Ask whether rearranging the same people creates a different outcome. Committee = combination; ranked positions = permutation.' },
  { id:'ps10', exam:'GRE', section:'Quant', type:'PS', topic:'Sequences', d:3,
    stem:'In a sequence, a₁ = 3 and each term after the first is 4 greater than the preceding term. What is a₂₀?',
    choices:['76','79','80','83','87'], answer:1,
    explain:'This is arithmetic with common difference 4. From a₁ to a₂₀ there are 19 steps, so a₂₀ = 3 + 19(4) = 3 + 76 = 79.',
    take:'The step count is n − 1, not n. Off-by-one here is the single most common arithmetic-sequence error.' },
  { id:'ps11', exam:'GRE', section:'Quant', type:'PS', topic:'Ratios', d:3,
    stem:'If a : b = 3 : 4 and b : c = 6 : 5, what is a : c?',
    choices:['9 : 10','2 : 5','3 : 5','18 : 20','5 : 6'], answer:0,
    explain:'Scale so the shared term matches. Multiply the first ratio by 3 → a : b = 9 : 12; multiply the second by 2 → b : c = 12 : 10. Chaining gives a : b : c = 9 : 12 : 10, so a : c = 9 : 10.',
    take:'To chain ratios, force the common term to the LCM of its two values. Note 18:20 reduces to 9:10 — check whether a choice is your answer unreduced.' },
  { id:'ps12', exam:'GRE', section:'Quant', type:'PS', topic:'Functions', d:2,
    stem:'If f(x) = 2x² − 3x + 1, what is f(−2)?',
    choices:['3','7','11','15','19'], answer:3,
    explain:'f(−2) = 2(−2)² − 3(−2) + 1 = 2(4) + 6 + 1 = 15. The middle term becomes positive because subtracting a negative adds.',
    take:'Square first, then apply the coefficient. Writing (−2)² explicitly with parentheses prevents the sign slip.' },
  { id:'ps13', exam:'GRE', section:'Quant', type:'PS', topic:'Exponents', d:2,
    stem:'If 2ˣ = 32, what is the value of 2ˣ⁺³?',
    choices:['35','64','128','256','512'], answer:3,
    explain:'2ˣ⁺³ = 2ˣ · 2³ = 32 × 8 = 256. You never need to find x, though x = 5 confirms it.',
    take:'Split the exponent rather than solving for the variable: a^(m+n) = a^m · a^n.' },
  { id:'ps14', exam:'GRE', section:'Quant', type:'PS', topic:'Geometry', d:3,
    stem:'In a 30-60-90 triangle, the shorter leg has length 5. What is the length of the longer leg?',
    choices:['5√2','5√3','10','10√3','15'], answer:1,
    explain:'The 30-60-90 side ratio is x : x√3 : 2x, with x opposite the 30° angle. With x = 5, the longer leg is 5√3 ≈ 8.66 and the hypotenuse is 10.',
    take:'Anchor both special triangles by the short side: 30-60-90 is x : x√3 : 2x, and 45-45-90 is x : x : x√2.' },
  { id:'ps15', exam:'GRE', section:'Quant', type:'PS', topic:'Percents', d:4,
    stem:'An investment of $5,000 earns 6% interest compounded annually. What is its value after 2 years?',
    choices:['$5,600','$5,618','$5,636','$5,700','$5,720'], answer:1,
    explain:'5000(1.06)² = 5000(1.1236) = $5,618. Simple interest would give $5,600, so the extra $18 is the interest earned on the first year\'s interest.',
    take:'Compound minus simple over two years equals interest on the first year\'s interest — a quick way to eliminate the simple-interest trap.' },

  { id:'ps16', exam:'GRE', section:'Quant', type:'PS', topic:'Algebra', d:4,
    stem:'If x + 1/x = 5, what is the value of x² + 1/x²?',
    choices:['21','23','24','25','27'], answer:1,
    explain:'Square both sides: (x + 1/x)² = x² + 2 + 1/x² = 25. Subtract the middle term: x² + 1/x² = 23. You never need to solve for x.',
    take:'Squaring x + 1/x always produces the cross term 2, because x · (1/x) = 1. Memorize this pairing — it appears constantly.' },
  { id:'ps17', exam:'GRE', section:'Quant', type:'PS', topic:'Percents', d:2,
    stem:'After a 30% discount, a shirt sells for $49. What was its original price?',
    choices:['$63.70','$65.00','$70.00','$72.50','$79.00'], answer:2,
    explain:'The sale price is 70% of the original: 0.70P = 49, so P = 70. Adding 30% back to $49 gives $63.70, which is the trap answer.',
    take:'To reverse a percent change, divide by the multiplier. Adding the same percent back always undershoots.' },
  { id:'ps18', exam:'GRE', section:'Quant', type:'PS', topic:'Ratios', d:2,
    stem:'The ratio of boys to girls in a class is 5 : 4. If the class has 36 students, how many are boys?',
    choices:['16','18','20','24','25'], answer:2,
    explain:'The ratio has 5 + 4 = 9 parts, so each part is 36/9 = 4 students. Boys = 5 × 4 = 20.',
    take:'Convert a ratio into parts and find the value of one part. That single number answers every follow-up the question can ask.' },
  { id:'ps19', exam:'GRE', section:'Quant', type:'PS', topic:'Number properties', d:2,
    stem:'What is the least positive integer divisible by each of 2, 3, 4, 5, and 6?',
    choices:['30','60','120','360','720'], answer:1,
    explain:'Take the highest power of each prime that appears: 2² (from 4), 3 (from 3 and 6), and 5. That gives 4 × 3 × 5 = 60.',
    take:'LCM is built from the highest power of each prime, not the product of the numbers. Multiplying them all gives a common multiple, just not the least.' },
  { id:'ps20', exam:'GRE', section:'Quant', type:'PS', topic:'Geometry', d:3,
    stem:'A cube has a surface area of 96. What is its volume?',
    choices:['48','64','96','125','216'], answer:1,
    explain:'A cube has 6 identical faces, so 6s² = 96 gives s² = 16 and s = 4. Volume = 4³ = 64.',
    take:'Move through the side length. Surface area gives s², volume needs s³ — you can never jump between them directly.' },
  { id:'ps21', exam:'GRE', section:'Quant', type:'PS', topic:'Percents', d:2,
    stem:'If 40% of x is 60, what is 25% of x?',
    choices:['15','24','30','37.5','40'], answer:3,
    explain:'0.40x = 60 gives x = 150. Then 0.25 × 150 = 37.5.',
    take:'Find the whole before taking a second percentage of it. Applying the new percent to the given part instead is the standard error.' },
  { id:'ps22', exam:'GRE', section:'Quant', type:'PS', topic:'Coordinate geometry', d:2,
    stem:'What is the perimeter of the triangle with vertices at (0, 0), (6, 0), and (6, 8)?',
    choices:['14','20','24','28','48'], answer:2,
    explain:'The legs are horizontal (length 6) and vertical (length 8), meeting at a right angle. The hypotenuse is a 6-8-10 triangle, so the perimeter is 6 + 8 + 10 = 24.',
    take:'Sketch coordinate figures. Right angles at axis-parallel corners turn distance formula work into a recognized triple.' },
  { id:'ps23', exam:'GRE', section:'Quant', type:'PS', topic:'Probability', d:2,
    stem:'An integer is chosen at random from 1 to 20, inclusive. What is the probability that it is prime?',
    choices:['1/4','2/5','9/20','1/2','11/20'], answer:1,
    explain:'The primes to 20 are 2, 3, 5, 7, 11, 13, 17, 19 — eight of them. Probability = 8/20 = 2/5. Note that 1 is not prime.',
    take:'One is not a prime number, and two is the only even prime. Both facts are tested deliberately.' },
  { id:'ps24', exam:'GRE', section:'Quant', type:'PS', topic:'Probability', d:3,
    stem:'Two fair six-sided dice are rolled. What is the probability that the sum is 8?',
    choices:['1/9','5/36','1/6','7/36','2/9'], answer:1,
    explain:'There are 36 equally likely ordered outcomes. Sums of 8 come from (2,6), (3,5), (4,4), (5,3), (6,2) — five ways. Probability = 5/36.',
    take:'Count ordered pairs, not unordered ones. (2,6) and (6,2) are separate outcomes; only the doubles appear once.' },
  { id:'ps25', exam:'GRE', section:'Quant', type:'PS', topic:'Exponents', d:3,
    stem:'If 3ˣ · 9ˣ = 27⁴, what is the value of x?',
    choices:['2','3','4','6','12'], answer:2,
    explain:'Convert to base 3: 3ˣ · 3²ˣ = 3³ˣ, and 27⁴ = 3¹². So 3x = 12 and x = 4.',
    take:'Force everything to a common base before touching the exponents. Powers of 2, 3, and 5 are the ones the test reuses.' },
  { id:'ps26', exam:'GRE', section:'Quant', type:'PS', topic:'Statistics', d:3,
    stem:'The average of 6 numbers is 15. If two numbers averaging 12 are removed, what is the average of the remaining 4?',
    choices:['15','16','16.5','17','18'], answer:2,
    explain:'Total = 6 × 15 = 90. The removed pair sums to 2 × 12 = 24. Remaining sum = 66, over 4 numbers, giving 16.5.',
    take:'Every average problem becomes easy once you convert to sums. Removing below-average values must raise the mean — use that to sanity-check.' },
  { id:'ps27', exam:'GRE', section:'Quant', type:'PS', topic:'Geometry', d:2,
    stem:'A circle has an area of 36π. What is its circumference?',
    choices:['6π','12π','18π','36π','72π'], answer:1,
    explain:'πr² = 36π gives r = 6. Circumference = 2πr = 12π.',
    take:'Always route through the radius. Area gives r², circumference gives r — the radius is the only shared handle.' },
  { id:'ps28', exam:'GRE', section:'Quant', type:'PS', topic:'Percents', d:3,
    stem:'A car worth $25,000 depreciates by 20% of its value each year. What is it worth after 2 years?',
    choices:['$15,000','$16,000','$16,500','$18,000','$20,000'], answer:1,
    explain:'Each year multiplies by 0.80: 25,000 × 0.80 × 0.80 = 25,000 × 0.64 = $16,000. Subtracting 40% outright would give the trap value of $15,000.',
    take:'Repeated percent decline is multiplicative. Two 20% drops remove 36%, not 40%, because the second applies to a smaller base.' },
  { id:'ps29', exam:'GRE', section:'Quant', type:'PS', topic:'Sets', d:3,
    stem:'In a group of 30 people, 18 like coffee, 15 like tea, and 5 like neither. How many like both?',
    choices:['3','5','8','10','12'], answer:2,
    explain:'People liking at least one = 30 − 5 = 25. By inclusion-exclusion, 18 + 15 − both = 25, so both = 8.',
    take:'Strip out the "neither" group first, then apply inclusion-exclusion to what remains. Doing it in the other order tangles the totals.' },

  { id:'ps30', exam:'GRE', section:'Quant', type:'PS', topic:'Algebra', d:5,
    stem:'If x + y = 7 and x² + y² = 29, what is the value of x³ + y³?',
    choices:['91','105','119','133','147'], answer:3,
    explain:'From (x + y)² = x² + 2xy + y², we get 49 = 29 + 2xy, so xy = 10. Then x³ + y³ = (x + y)³ − 3xy(x + y) = 343 − 3(10)(7) = 133.',
    take:'Symmetric expressions reduce to the sum and product. Learn (x+y)² and (x+y)³ expansions so you never need the individual values.' },
  { id:'ps31', exam:'GRE', section:'Quant', type:'PS', topic:'Combinatorics', d:5,
    stem:'A committee of 4 is selected from 6 men and 5 women. How many committees include at least 2 women?',
    choices:['185','200','215','230','245'], answer:2,
    explain:'Total committees = C(11,4) = 330. Subtract those with 0 women, C(6,4) = 15, and 1 woman, C(5,1)·C(6,3) = 5 × 20 = 100. So 330 − 115 = 215.',
    take:'"At least" almost always means total minus the small forbidden cases. Counting the allowed cases directly takes three times as long.' },
  { id:'ps32', exam:'GRE', section:'Quant', type:'PS', topic:'Statistics', d:4,
    stem:'Five different positive integers have an average of 10. What is the greatest possible value of the largest integer?',
    choices:['34','36','38','40','44'], answer:3,
    explain:'The sum is fixed at 50. To maximize one value, minimize the rest with distinct positive integers: 1 + 2 + 3 + 4 = 10. The largest is 50 − 10 = 40.',
    take:'To maximize one member of a fixed-sum set, push every other member to its legal minimum. "Different" forces 1, 2, 3, 4 rather than four 1s.' },
  { id:'ps33', exam:'GRE', section:'Quant', type:'PS', topic:'Geometry', d:4,
    stem:'A circle with center O has radius 6. Chord AB has length 6. What is the area of the minor sector AOB?',
    choices:['3π','6π','9π','12π','18π'], answer:1,
    explain:'OA, OB, and AB all equal 6, so triangle AOB is equilateral and the central angle is 60°. The sector is 60/360 = 1/6 of the circle: (1/6)(36π) = 6π.',
    take:'A chord equal to the radius always subtends 60°. Spotting the equilateral triangle removes all trigonometry.' },
  { id:'ps34', exam:'GRE', section:'Quant', type:'PS', topic:'Mixtures', d:5,
    stem:'A tank holds 60 liters of a solution that is 40% salt. How many liters must be drained and replaced with pure water so that the result is 25% salt?',
    choices:['15','18','20','22.5','25'], answer:3,
    explain:'The tank starts with 24 L of salt. Draining x liters removes 0.40x of salt, and the total returns to 60. So (24 − 0.4x)/60 = 0.25, giving 24 − 0.4x = 15 and x = 22.5.',
    take:'Drain-and-replace keeps the volume constant and removes solute proportionally. Track the solute only; the denominator never moves.' },
  { id:'ps35', exam:'GRE', section:'Quant', type:'PS', topic:'Combinatorics', d:4,
    stem:'In how many distinct ways can the letters of the word LEVEL be arranged?',
    choices:['20','30','60','90','120'], answer:1,
    explain:'Five letters with two Ls and two Es repeated: 5!/(2!·2!) = 120/4 = 30.',
    take:'Divide by the factorial of each repeated letter\'s count. Forgetting one repeat group is the standard error in these.' },
  { id:'ps36', exam:'GRE', section:'Quant', type:'PS', topic:'Functions', d:4,
    stem:'If f(x) = x/(x − 1) for all x ≠ 1, what is f(f(3))?',
    choices:['3/2','2','3','9/2','6'], answer:2,
    explain:'f(3) = 3/2. Then f(3/2) = (3/2)/(3/2 − 1) = (3/2)/(1/2) = 3. The function is its own inverse, so applying it twice returns the input.',
    take:'Compute the inner value fully before substituting. Functions that undo themselves appear often enough to notice the pattern.' },
  { id:'ps37', exam:'GRE', section:'Quant', type:'PS', topic:'Geometry', d:4,
    stem:'A rectangular box measures 3 by 4 by 12. What is the length of the longest straight rod that fits inside?',
    choices:['12','13','14','15','19'], answer:1,
    explain:'The space diagonal is √(3² + 4² + 12²) = √(9 + 16 + 144) = √169 = 13.',
    take:'The 3D diagonal adds a third square under the same root. The face diagonal (5 here) is a common trap answer.' },
  { id:'ps38', exam:'GRE', section:'Quant', type:'PS', topic:'Rates', d:5,
    stem:'Working together, two pumps fill a tank in 4 hours. Alone, the slower pump takes 6 hours longer than the faster one. How many hours does the faster pump take alone?',
    choices:['4','5','6','8','12'], answer:2,
    explain:'Let the faster pump take b hours: 1/b + 1/(b + 6) = 1/4. Clearing denominators gives b² − 2b − 24 = 0, so (b − 6)(b + 4) = 0 and b = 6. Check: 1/6 + 1/12 = 1/4. ✓',
    take:'Combined-rate problems with an unknown offset produce a quadratic. Discard the negative root and verify by substituting back.' },
  { id:'ps39', exam:'GRE', section:'Quant', type:'PS', topic:'Combinatorics', d:4,
    stem:'If n!/(n − 2)! = 90, what is n?',
    choices:['9','10','11','12','15'], answer:1,
    explain:'The quotient cancels to n(n − 1) = 90. Two consecutive integers multiplying to 90 gives 10 × 9, so n = 10.',
    take:'Factorial ratios collapse to a short product. n!/(n−k)! is always the top k consecutive integers multiplied together.' },
  { id:'ps40', exam:'GRE', section:'Quant', type:'PS', topic:'Probability', d:4,
    stem:'The probability of rain on Saturday is 0.4 and on Sunday is 0.5, independently. What is the probability that it rains on at least one of the two days?',
    choices:['0.20','0.45','0.70','0.80','0.90'], answer:2,
    explain:'P(no rain either day) = 0.6 × 0.5 = 0.30. So P(at least one) = 1 − 0.30 = 0.70. Adding 0.4 + 0.5 double-counts the day both occur.',
    take:'"At least one" is one minus the probability of none. Adding individual probabilities is valid only for mutually exclusive events.' },

  /* ---------- GRE NUMERIC ENTRY ---------- */
  { id:'ne1', exam:'GRE', section:'Quant', type:'NE', topic:'Number properties', d:3,
    stem:'How many integers from 1 to 100, inclusive, are divisible by both 4 and 6?',
    answer:'8',
    explain:'A number divisible by both is divisible by their least common multiple, 12. The multiples of 12 up to 100 are 12, 24, 36, 48, 60, 72, 84, 96 — eight values. Equivalently, floor(100/12) = 8.',
    take:'"Divisible by both" means divisible by the LCM, not the product. LCM(4,6) = 12, not 24.' },
  { id:'ne2', exam:'GRE', section:'Quant', type:'NE', topic:'Algebra', d:3,
    stem:'If |2x − 5| = 9, what is the sum of all possible values of x?',
    answer:'5',
    explain:'Split the absolute value: 2x − 5 = 9 gives x = 7, and 2x − 5 = −9 gives x = −2. Their sum is 5.',
    take:'Every absolute-value equation is two equations. The roots are symmetric about the value that zeroes the inside — here x = 2.5, and 7 and −2 sit equidistant from it.' },
  { id:'ne3', exam:'GRE', section:'Quant', type:'NE', topic:'Coordinate geometry', d:2,
    stem:'What is the slope of the line passing through the points (2, −3) and (6, 5)?',
    answer:'2',
    explain:'Slope = (5 − (−3)) / (6 − 2) = 8/4 = 2.',
    take:'Subtract in the same order top and bottom. Reversing one but not the other flips the sign — a frequent careless loss.' },
  { id:'ne4', exam:'GRE', section:'Quant', type:'NE', topic:'Statistics', d:4,
    stem:'A set of 7 consecutive integers has a sum of 84. What is the largest integer in the set?',
    answer:'15',
    explain:'For an odd count of consecutive integers, the mean equals the median: 84/7 = 12 is the middle term. The set is 9 through 15, so the largest is 15.',
    take:'In any evenly spaced set, mean = median. That single fact collapses most consecutive-integer problems to one division.' },

  /* ---------- GRE DATA INTERPRETATION ---------- */
  { id:'di1', exam:'GRE', section:'Quant', type:'DI', topic:'Data interpretation', d:2, table:'rev',
    stem:'By what percent did Software revenue increase from 2021 to 2023?',
    choices:['50%','80%','100%','160%','200%'], answer:2,
    explain:'Software went from $80M to $160M, an increase of $80M. Percent increase = 80/80 = 100%. The value 200% is the ratio of new to old, not the increase.',
    take:'Percent increase divides the change by the original, never by the new value. Doubling is always +100%.' },
  { id:'di2', exam:'GRE', section:'Quant', type:'DI', topic:'Data interpretation', d:3, table:'rev',
    stem:'In 2022, Aerospace revenue was approximately what percent of total revenue?',
    choices:['41%','45%','49%','53%','60%'], answer:2,
    explain:'150/305 ≈ 0.492, so about 49%. Estimating is enough: 150 is just under half of 305, which rules out everything except 49%.',
    take:'On DI, estimate against benchmarks like 1/2, 1/3, and 1/4 before computing. The choices are usually spread far enough apart to make exact division unnecessary.' },
  { id:'di3', exam:'GRE', section:'Quant', type:'DI', topic:'Data interpretation', d:3, table:'rev',
    stem:'Which division had the greatest absolute dollar increase in revenue from 2021 to 2023, and by how much?',
    choices:['Aerospace, $45M','Aerospace, $80M','Software, $45M','Software, $80M','Materials, $10M'], answer:3,
    explain:'Aerospace rose 165 − 120 = $45M; Software rose 160 − 80 = $80M; Materials fell $10M. Software has the largest absolute gain even though Aerospace remains larger in total.',
    take:'Read whether the question asks for absolute change or percent change. Here Software wins both, but they often diverge.' },
  { id:'di4', exam:'GRE', section:'Quant', type:'DI', topic:'Data interpretation', d:4, table:'ship',
    stem:'Approximately how many more of Toledo\'s Q1 orders were delivered on time than Macon\'s?',
    choices:['about 12,000','about 21,000','about 26,000','about 32,000','about 54,000'], answer:1,
    explain:'Toledo: 0.88 × 61,000 ≈ 53,700. Macon: 0.92 × 35,000 = 32,200. The difference is about 21,500. Note the lower on-time rate still yields far more on-time orders because the volume is much larger.',
    take:'A rate and a count answer different questions. Always apply the percentage to its own base before comparing.' },

  { id:'ne5', exam:'GRE', section:'Quant', type:'NE', topic:'Geometry', d:2,
    stem:'What is the sum, in degrees, of the interior angles of a hexagon?',
    answer:'720',
    explain:'The interior angle sum of an n-sided polygon is (n − 2) × 180. For n = 6: 4 × 180 = 720.',
    take:'The formula counts triangles: any n-gon splits into n − 2 triangles from one vertex.' },
  { id:'ne6', exam:'GRE', section:'Quant', type:'NE', topic:'Number properties', d:3,
    stem:'How many positive divisors does 36 have?',
    answer:'9',
    explain:'36 = 2² × 3². Add one to each exponent and multiply: (2+1)(2+1) = 9. They are 1, 2, 3, 4, 6, 9, 12, 18, 36.',
    take:'Divisor count comes from the prime factorization: add one to every exponent, then multiply.' },
  { id:'ne7', exam:'GRE', section:'Quant', type:'NE', topic:'Statistics', d:2,
    stem:'What is the median of 4, 9, 2, 15, 7, and 11?',
    answer:'8',
    explain:'Sorted: 2, 4, 7, 9, 11, 15. With an even count, the median is the average of the two middle values: (7 + 9)/2 = 8.',
    take:'Sort first, every time. With an even count the median need not be a member of the set.' },
  { id:'ne8', exam:'GRE', section:'Quant', type:'NE', topic:'Algebra', d:4,
    stem:'If the sum of three consecutive odd integers is 51, what is the largest of the three?',
    answer:'19',
    explain:'For three consecutive terms, the middle one equals the mean: 51/3 = 17. The integers are 15, 17, 19, so the largest is 19.',
    take:'For any odd count of evenly spaced terms, divide the sum by the count to get the middle term instantly.' },
  { id:'ne9', exam:'GRE', section:'Quant', type:'NE', topic:'Rates', d:4,
    stem:'A tank is filled by one pipe in 20 minutes and drained by another in 30 minutes. With both open on an empty tank, how many minutes does it take to fill?',
    answer:'60',
    explain:'Net rate = 1/20 − 1/30 = 3/60 − 2/60 = 1/60 tank per minute. Time = 60 minutes.',
    take:'Opposing rates subtract. Set up the net rate first and invert only at the end.' },

  { id:'di5', exam:'GRE', section:'Quant', type:'DI', topic:'Data interpretation', d:3, table:'grad',
    stem:'Which program had the lowest admission rate?',
    choices:['Mechanical, about 25%','Electrical, about 20%','Civil, about 35%','Industrial, about 35%','Mechanical, about 20%'], answer:1,
    explain:'Mechanical: 310/1,240 = 25%. Electrical: 372/1,860 = 20%. Civil: 252/720 = 35%. Industrial: 189/540 = 35%. Electrical is lowest, despite admitting the most students.',
    take:'A rate needs its own denominator. The program admitting the most students here is also the most selective.' },
  { id:'di6', exam:'GRE', section:'Quant', type:'DI', topic:'Data interpretation', d:2, table:'grad',
    stem:'How many students were admitted across all four programs combined?',
    choices:['1,023','1,123','1,213','1,323','4,360'], answer:1,
    explain:'310 + 372 + 252 + 189 = 1,123.',
    take:'On straight-addition DI items, add in pairs — 310 + 372 and 252 + 189 — to reduce carrying errors.' },
  { id:'di7', exam:'GRE', section:'Quant', type:'DI', topic:'Data interpretation', d:3, table:'grad',
    stem:'The Civil admission rate exceeds the Electrical admission rate by approximately how many percentage points?',
    choices:['5','10','15','20','75'], answer:2,
    explain:'Civil is 252/720 = 35% and Electrical is 372/1,860 = 20%. The difference is 15 percentage points.',
    take:'Percentage points are a subtraction; percent change is a division. Here 35 − 20 = 15 points, but Civil\'s rate is 75% higher than Electrical\'s.' },
  { id:'di8', exam:'GRE', section:'Quant', type:'DI', topic:'Data interpretation', d:4, table:'grad',
    stem:'If Electrical receives 20% more applications next cycle and holds its admission rate constant, approximately how many students will it admit?',
    choices:['392','420','446','464','558'], answer:2,
    explain:'Applications rise to 1,860 × 1.20 = 2,232. At the same 20% rate, admits = 446. Equivalently, admits scale by the same 20%: 372 × 1.20 = 446.',
    take:'When a rate is held constant, the output scales by exactly the same factor as the input. Scaling the answer directly skips a step.' },
  { id:'di9', exam:'GRE', section:'Quant', type:'DI', topic:'Data interpretation', d:4, table:'rev',
    stem:'Materials revenue as a share of total revenue fell from 2021 to 2023 by approximately how many percentage points?',
    choices:['4','7','9','11','20'], answer:2,
    explain:'In 2021, 50/250 = 20%. In 2023, 40/365 ≈ 11%. The drop is about 9 percentage points. The share fell far faster than the dollar figure because the total grew while Materials shrank.',
    take:'A share can collapse even when the underlying value barely moves, if the denominator is growing. Always check both.' },
  { id:'di10', exam:'GRE', section:'Quant', type:'DI', topic:'Data interpretation', d:4, table:'ship',
    stem:'For Reno, what is the approximate fulfillment cost per on-time order?',
    choices:['$3.94','$4.10','$4.27','$4.55','$4.80'], answer:2,
    explain:'Reno spends $4.10 per order placed, but only 96% arrive on time. Cost per on-time order = 4.10/0.96 ≈ $4.27. Dividing by a number below 1 must increase the result.',
    take:'"Cost per successful unit" divides total cost by successes, not by attempts. The answer always exceeds the headline unit cost.' },

  { id:'ne10', exam:'GRE', section:'Quant', type:'NE', topic:'Combinatorics', d:5,
    stem:'How many three-digit integers have three distinct digits?',
    answer:'648',
    explain:'The hundreds digit has 9 options (1–9). The tens digit has 9 remaining options, since 0 is now allowed but the hundreds digit is not. The units digit has 8. Total: 9 × 9 × 8 = 648.',
    take:'Fill the most constrained slot first. The leading digit excludes 0, which changes the count for every later position.' },
  { id:'ne11', exam:'GRE', section:'Quant', type:'NE', topic:'Sequences', d:4,
    stem:'The sum of the first n positive integers is 210. What is n?',
    answer:'20',
    explain:'n(n + 1)/2 = 210 gives n(n + 1) = 420. Two consecutive integers multiplying to 420 are 20 and 21, so n = 20.',
    take:'For n(n+1) = k, take √k and check the two integers around it. Here √420 ≈ 20.5, pointing straight at 20 and 21.' },
  { id:'ne12', exam:'GRE', section:'Quant', type:'NE', topic:'Coordinate geometry', d:5,
    stem:'How many points with integer coordinates lie on the circle x² + y² = 25?',
    answer:'12',
    explain:'Integer solutions come from the pairs (0,5), (3,4), (4,3), and (5,0) with all sign combinations. That gives 4 points on the axes and 8 points from (±3,±4) and (±4,±3), for 12 total.',
    take:'Search only nonnegative solutions, then multiply by the sign combinations. Points on an axis have half as many reflections as points off it.' },
  { id:'ne13', exam:'GRE', section:'Quant', type:'NE', topic:'Number properties', d:5,
    stem:'What is the greatest integer k such that 10ᵏ divides 50! exactly?',
    answer:'12',
    explain:'Each factor of 10 needs a 2 and a 5, and 5s are scarcer. Count them: ⌊50/5⌋ = 10 plus ⌊50/25⌋ = 2, giving 12 fives. So k = 12.',
    take:'Trailing zeros are limited by the count of 5s. Divide by 5, then 25, then 125, and add the floors.' },

  { id:'di11', exam:'GRE', section:'Quant', type:'DI', topic:'Data interpretation', d:4, table:'grad',
    stem:'What was the overall admission rate across all four programs combined?',
    choices:['about 20%','about 23%','about 26%','about 29%','about 35%'], answer:2,
    explain:'Total admitted is 1,123 and total applications are 1,240 + 1,860 + 720 + 540 = 4,360. The rate is 1,123/4,360 ≈ 25.8%, or about 26%.',
    take:'A combined rate divides the totals, never averages the four individual rates. Averaging would ignore that Electrical carries the most applicants.' },
  { id:'di12', exam:'GRE', section:'Quant', type:'DI', topic:'Data interpretation', d:5, table:'grad',
    stem:'Weighting each program by the number of students it admitted, what is the approximate average GRE Quant score across all admitted students?',
    choices:['163.0','163.5','163.8','164.4','165.0'], answer:2,
    explain:'Weighted sum = 310(164) + 372(166) + 252(161) + 189(163) = 50,840 + 61,752 + 40,572 + 30,807 = 183,971. Divide by 1,123 admits: about 163.8. The unweighted mean of 163.5 differs because Electrical\'s higher score carries more weight.',
    take:'A weighted average pulls toward the largest group. If it matches the unweighted mean exactly, you have probably forgotten the weights.' },

  /* ---------- GRE TEXT COMPLETION ---------- */
  { id:'tc1', exam:'GRE', section:'Verbal', type:'TC', topic:'Text completion', d:2,
    stem:'Although the committee\'s report was ostensibly neutral, its highly selective use of evidence betrayed a distinctly ______ agenda.',
    choices:['partisan','empirical','tentative','exhaustive','conciliatory'], answer:0,
    explain:'"Although … ostensibly neutral" sets up a contrast, and "betrayed" signals something hidden and unflattering. Selective evidence points to bias, so "partisan" is the only word that opposes neutrality. "Exhaustive" is the opposite of selective.',
    take:'Predict your own word before reading the choices. Contrast markers — although, despite, yet — tell you the blank must reverse the stated idea.' },
  { id:'tc2', exam:'GRE', section:'Verbal', type:'TC', topic:'Text completion', d:3,
    stem:'The professor\'s lectures were so ______ that even students well versed in the subject struggled to follow the thread of her argument.',
    choices:['lucid','abstruse','perfunctory','animated','redundant'], answer:1,
    explain:'The result clause — even experts could not follow — demands a word meaning hard to understand. "Abstruse" fits exactly. "Lucid" means the opposite; "perfunctory" means done without care, which would not explain the difficulty for experts specifically.',
    take:'"So … that" constructions define the blank by their consequence. Read the result clause first and work backwards.' },
  { id:'tc3', exam:'GRE', section:'Verbal', type:'TC', topic:'Text completion', d:4,
    stem:'Far from being (i)______, the author\'s prose is so densely allusive that readers frequently require annotated editions to (ii)______ its meaning.',
    blanks:[
      { label:'Blank (i)', choices:['accessible','ornate','derivative'], answer:0 },
      { label:'Blank (ii)', choices:['obscure','apprehend','embellish'], answer:1 },
    ],
    explain:'"Far from being" negates the first blank, and the rest of the sentence describes difficulty — so blank (i) must be the quality being denied: accessible. Readers turn to annotations in order to grasp meaning, so blank (ii) is "apprehend." "Obscure" would mean to hide it, which reverses the purpose.',
    take:'Fill the blank you are most confident about first, then use it to constrain the others. Two-blank questions are all-or-nothing, so verify both before submitting.' },
  { id:'tc4', exam:'GRE', section:'Verbal', type:'TC', topic:'Text completion', d:4,
    stem:'The startup\'s early success proved (i)______: within eighteen months, the very features that had (ii)______ investors were being offered free of charge by larger competitors.',
    blanks:[
      { label:'Blank (i)', choices:['ephemeral','enduring','lucrative'], answer:0 },
      { label:'Blank (ii)', choices:['alienated','captivated','bewildered'], answer:1 },
    ],
    explain:'The colon means the second clause explains the first. Losing the differentiating features within eighteen months means the success did not last: "ephemeral." Those features had attracted investors in the first place, so "captivated."',
    take:'A colon or semicolon signals that the two halves agree. The second half is a definition of the first, not a contrast.' },
  { id:'tc5', exam:'GRE', section:'Verbal', type:'TC', topic:'Text completion', d:5,
    stem:'Historians once treated the treaty as a (i)______ moment, but recent scholarship suggests that its terms merely (ii)______ arrangements that had operated informally for decades, making the document less a rupture than a (iii)______.',
    blanks:[
      { label:'Blank (i)', choices:['pivotal','contested','obscure'], answer:0 },
      { label:'Blank (ii)', choices:['codified','overturned','anticipated'], answer:0 },
      { label:'Blank (iii)', choices:['ratification','revolution','aberration'], answer:0 },
    ],
    explain:'"But" reverses the old view, and the new view says nothing really changed — so the old view was that it was a turning point: "pivotal." The treaty put existing informal practice into writing: "codified." "Less a rupture than a ______" needs the opposite of rupture, meaning formal confirmation of what already existed: "ratification."',
    take:'The phrase "less X than Y" makes Y the near-opposite of X. Treat it as a built-in antonym clue.' },

  { id:'tc6', exam:'GRE', section:'Verbal', type:'TC', topic:'Text completion', d:2,
    stem:'The senator\'s address, though delivered with great passion, was ultimately ______: it proposed nothing concrete and identified no source of funding.',
    choices:['incendiary','vacuous','meticulous','protracted','conciliatory'], answer:1,
    explain:'The colon defines the blank — no proposals, no funding — so the speech was empty of substance. "Vacuous" means exactly that. "Protracted" refers to length, which the sentence never mentions.',
    take:'"Though" concedes one quality (passion) and the blank supplies the contrasting one. The concession tells you the blank must be unflattering.' },
  { id:'tc7', exam:'GRE', section:'Verbal', type:'TC', topic:'Text completion', d:3,
    stem:'Rather than ______ the housing crisis, the new zoning policy appears to have deepened it.',
    choices:['alleviating','exacerbating','precipitating','prolonging','obscuring'], answer:0,
    explain:'"Rather than X … deepened it" makes X the opposite of deepening, so the blank means to relieve. "Alleviating" fits. "Exacerbating" and "prolonging" are near-synonyms of deepening, so they destroy the contrast.',
    take:'"Rather than" flips polarity. Whatever the second clause says, the blank must say the reverse.' },
  { id:'tc8', exam:'GRE', section:'Verbal', type:'TC', topic:'Text completion', d:3,
    stem:'Critics dismissed the novel as derivative, but its admirers praised the ______ with which it reworked familiar material.',
    choices:['ingenuity','banality','brevity','solemnity','timidity'], answer:0,
    explain:'"But" opposes the critics\' charge of being unoriginal, so the admirers must be praising inventiveness. "Ingenuity" is the counterweight; "banality" and "timidity" would agree with the critics.',
    take:'When two camps disagree, the blank belongs to one of them. Identify whose side it is on before choosing.' },
  { id:'tc9', exam:'GRE', section:'Verbal', type:'TC', topic:'Text completion', d:3,
    stem:'The archaeologist\'s conclusions remain ______, resting as they do on a single fragmentary inscription.',
    choices:['tentative','definitive','ubiquitous','verbose','ancillary'], answer:0,
    explain:'A single damaged piece of evidence cannot support firm claims, so the conclusions are provisional. "Tentative" fits and "definitive" reverses it.',
    take:'A participial phrase after the comma explains the blank. Read it as "because…" and the required meaning appears.' },
  { id:'tc10', exam:'GRE', section:'Verbal', type:'TC', topic:'Text completion', d:4,
    stem:'Once an ______ discipline practiced by a handful of specialists, bioinformatics now employs tens of thousands worldwide.',
    choices:['esoteric','lucrative','contentious','empirical','venerable'], answer:0,
    explain:'"Once … now" contrasts a small specialist field with a mass profession, so the blank means known to very few. "Esoteric" delivers that. "Venerable" means respected by age and says nothing about scale.',
    take:'Match the blank to the specific detail, not the general mood. "A handful of specialists" is about audience size, so the blank must be too.' },
  { id:'tc11', exam:'GRE', section:'Verbal', type:'TC', topic:'Text completion', d:4,
    stem:'The manuscript\'s (i)______ condition made transcription arduous: whole passages had been (ii)______ by centuries of damp.',
    blanks:[
      { label:'Blank (i)', choices:['pristine','parlous','curious'], answer:1 },
      { label:'Blank (ii)', choices:['effaced','preserved','annotated'], answer:0 },
    ],
    explain:'Transcription was hard, so the condition was poor — "parlous" means perilously bad. Damp destroys text, so passages were "effaced." "Preserved" would make transcription easy, contradicting the sentence.',
    take:'Let the physical cause fix the blank. Damp erases; fire chars; light fades. The verb must match the agent named.' },
  { id:'tc12', exam:'GRE', section:'Verbal', type:'TC', topic:'Text completion', d:4,
    stem:'Because the data were gathered by (i)______ methods, the study\'s findings, however suggestive, cannot be regarded as (ii)______.',
    blanks:[
      { label:'Blank (i)', choices:['rigorous','informal','novel'], answer:1 },
      { label:'Blank (ii)', choices:['conclusive','preliminary','intriguing'], answer:0 },
    ],
    explain:'"Cannot be regarded as ___" is a limitation, so blank (ii) is the strong status being denied: conclusive. That limitation must follow from weak methodology, so blank (i) is "informal." "Rigorous" would support the findings, not undercut them.',
    take:'"However suggestive" concedes some value while denying more. The blank after "cannot be" is always the stronger claim.' },
  { id:'tc13', exam:'GRE', section:'Verbal', type:'TC', topic:'Text completion', d:5,
    stem:'The director\'s later films display a (i)______ that his early work wholly lacked: where he once (ii)______ every emotion with swelling music, he now trusts the audience to infer it.',
    blanks:[
      { label:'Blank (i)', choices:['restraint','exuberance','incoherence'], answer:0 },
      { label:'Blank (ii)', choices:['underscored','concealed','misread'], answer:0 },
    ],
    explain:'The second clause contrasts heavy musical signposting with quiet trust in the viewer, so the new quality is "restraint." Swelling music emphasizes rather than hides, so "underscored" is right — "concealed" reverses the image.',
    take:'When a colon introduces a "where he once… he now…" pair, the two halves are opposites. Fill both blanks from the same contrast.' },
  { id:'tc14', exam:'GRE', section:'Verbal', type:'TC', topic:'Text completion', d:4,
    stem:'Far from (i)______ the debate, the new evidence has (ii)______ it, prompting a fresh round of contention among specialists.',
    blanks:[
      { label:'Blank (i)', choices:['settling','inflaming','complicating'], answer:0 },
      { label:'Blank (ii)', choices:['reignited','resolved','preempted'], answer:0 },
    ],
    explain:'"Far from X, it has Y" makes X and Y opposites, and the fresh contention tells us Y means to restart the argument: "reignited." So blank (i) must be its opposite, "settling."',
    take:'Solve the blank with the most textual support first. Here "prompting a fresh round of contention" pins blank (ii), which then forces blank (i).' },
  { id:'tc15', exam:'GRE', section:'Verbal', type:'TC', topic:'Text completion', d:5,
    stem:'The company\'s founders were long celebrated as (i)______ innovators, but internal records show that most of their signature patents were (ii)______ from smaller firms, a practice that renders the celebratory account not merely incomplete but (iii)______.',
    blanks:[
      { label:'Blank (i)', choices:['visionary','reluctant','cautious'], answer:0 },
      { label:'Blank (ii)', choices:['acquired','developed','withheld'], answer:0 },
      { label:'Blank (iii)', choices:['misleading','exhaustive','plausible'], answer:0 },
    ],
    explain:'They were celebrated as innovators, so blank (i) is "visionary." The records undercut that, meaning the patents came from elsewhere: "acquired." "Not merely incomplete but ___" escalates, so blank (iii) is stronger than incomplete: "misleading."',
    take:'"Not merely X but Y" means Y is a more severe version of X. Look for the escalation, not a synonym.' },
  { id:'tc16', exam:'GRE', section:'Verbal', type:'TC', topic:'Text completion', d:5,
    stem:'Although her surgical methods struck contemporaries as (i)______, they were in fact (ii)______ rooted in an older tradition that had simply fallen out of (iii)______.',
    blanks:[
      { label:'Blank (i)', choices:['unprecedented','orthodox','careless'], answer:0 },
      { label:'Blank (ii)', choices:['firmly','tenuously','mistakenly'], answer:0 },
      { label:'Blank (iii)', choices:['favor','disrepute','circulation'], answer:0 },
    ],
    explain:'"Although … in fact" reverses the perception, so contemporaries thought the methods were new: "unprecedented." The reality is deep traditional grounding: "firmly." A tradition stops being used when it falls out of "favor" — falling out of disrepute would mean gaining respect.',
    take:'Watch for idioms with built-in negatives. "Fall out of disrepute" is a double negative and means the opposite of what a quick read suggests.' },
  { id:'tc17', exam:'GRE', section:'Verbal', type:'TC', topic:'Text completion', d:5,
    stem:'The treaty\'s language is deliberately (i)______, permitting each signatory to declare (ii)______ at home while committing itself to (iii)______ abroad.',
    blanks:[
      { label:'Blank (i)', choices:['elastic','precise','hostile'], answer:0 },
      { label:'Blank (ii)', choices:['victory','defeat','neutrality'], answer:0 },
      { label:'Blank (iii)', choices:['very little','sweeping reform','immediate disarmament'], answer:0 },
    ],
    explain:'Vague wording lets everyone read what they want into it, so blank (i) is "elastic." Governments announce success domestically: "victory." The point of the vagueness is that nothing binding was actually promised: "very little."',
    take:'When a sentence describes a document as deliberately ambiguous, the remaining blanks describe the gap between appearance and obligation.' },

  /* ---------- GRE SENTENCE EQUIVALENCE ---------- */
  { id:'se1', exam:'GRE', section:'Verbal', type:'SE', topic:'Sentence equivalence', d:3,
    stem:'Despite the gravity of the charges against him, the defendant remained remarkably ______, betraying no outward sign of anxiety.',
    choices:['composed','contrite','unruffled','voluble','indignant','evasive'], answer:[0,2],
    explain:'"Betraying no sign of anxiety" requires calm. "Composed" and "unruffled" are near-synonyms and both produce that meaning. "Contrite" (remorseful) and "indignant" (angry) describe other emotions, and neither has a partner among the choices.',
    take:'Sentence Equivalence needs a matching pair, not just two words that fit. Scan for synonym pairs first, then test the pair against the sentence.' },
  { id:'se2', exam:'GRE', section:'Verbal', type:'SE', topic:'Sentence equivalence', d:3,
    stem:'The new evidence did not overturn the prevailing theory outright, but it did ______ several of its central claims.',
    choices:['corroborate','undermine','articulate','weaken','reiterate','exacerbate'], answer:[1,3],
    explain:'"Did not overturn outright, but did ___" signals partial damage. "Undermine" and "weaken" are synonyms that deliver exactly that. "Corroborate" reverses the meaning; "exacerbate" means to worsen a problem, which does not apply to claims.',
    take:'"Not X outright, but Y" means Y is a milder version of X, not its opposite. Match the intensity, not just the direction.' },
  { id:'se3', exam:'GRE', section:'Verbal', type:'SE', topic:'Sentence equivalence', d:4,
    stem:'Her account of the expedition is refreshingly ______: she describes her own missteps as candidly as her triumphs.',
    choices:['laudatory','unvarnished','meandering','forthright','ambivalent','embellished'], answer:[1,3],
    explain:'The colon defines the blank: describing her own failures candidly means the account is honest and unflattering. "Unvarnished" and "forthright" both mean plainly truthful. "Embellished" is the direct opposite, and "laudatory" would mean she praises rather than admits.',
    take:'When a colon follows the blank, the rest of the sentence is a definition. Read past it before you look at any choices.' },
  { id:'se4', exam:'GRE', section:'Verbal', type:'SE', topic:'Sentence equivalence', d:4,
    stem:'Once considered ______, the surgical technique is now taught in every teaching hospital in the country.',
    choices:['heterodox','indispensable','unorthodox','rudimentary','expedient','ubiquitous'], answer:[0,2],
    explain:'"Once … now standard" is a contrast, so the blank must mean the opposite of accepted practice. "Heterodox" and "unorthodox" are direct synonyms meaning contrary to established norms. "Ubiquitous" and "indispensable" describe its current status, not its former one.',
    take:'"Once … now" always reverses. Watch for choices that describe the present state — they are placed there to catch a misread of the timeline.' },

  /* ---------- GRE READING COMPREHENSION ---------- */
  { id:'rc1', exam:'GRE', section:'Verbal', type:'RC', topic:'Reading comprehension', d:3, passage:'threads',
    stem:'The primary purpose of the passage is to',
    choices:[
      'trace the technical development of standardized screw threads',
      'correct a common interpretation of a historical episode',
      'argue that Whitworth\'s thread geometry was technically inferior',
      'describe the maintenance practices of British railway companies',
      'propose a new method for setting industrial standards'],
    answer:1,
    explain:'The pivot is "Historians who treat the standard as a triumph of engineering insight thus misread the episode." Everything before builds to that correction and everything after draws the lesson. Choice C overstates: the passage says rival forms performed comparably, not that Whitworth\'s was worse.',
    take:'Purpose answers must cover the whole passage. Choices that name a real detail — the railways, the geometry — are usually scope traps.' },
  { id:'rc2', exam:'GRE', section:'Verbal', type:'RC', topic:'Reading comprehension', d:4, passage:'threads',
    stem:'The author mentions that rival thread forms "performed comparably under load" primarily in order to',
    choices:[
      'demonstrate the sophistication of nineteenth-century metallurgy',
      'explain why machinists resisted adopting any single standard',
      'support the claim that Whitworth\'s system did not prevail on technical merit',
      'suggest that the choice of standard was ultimately arbitrary',
      'contrast British practice with that of other industrial nations'],
    answer:2,
    explain:'The detail directly serves the sentence it sits in: the innovation was administrative rather than technical. If rivals worked just as well, technical superiority cannot explain adoption. Choice D goes too far — the passage says the choice was driven by railway purchasing power, which is a reason, not arbitrariness.',
    take:'"In order to" questions ask for function, not content. Reread the sentence immediately before and after the cited detail; the answer is almost always the claim it supports.' },
  { id:'rc3', exam:'GRE', section:'Verbal', type:'RC', topic:'Reading comprehension', d:4, passage:'coral',
    stem:'According to the passage, the comparison between coral reefs and rainforests is misleading because',
    choices:[
      'rainforests recycle nutrients less efficiently than reefs do',
      'reef productivity depends on symbiotic algae rather than on soil',
      'the water surrounding most reefs is itself nutrient-poor in absolute terms',
      'rainforests contain a greater number of species than reefs do',
      'thermal stress affects reefs but has no analogue in rainforests'],
    answer:2,
    explain:'The passage draws the distinction explicitly: rainforest soils are poor because nutrients are held in living biomass, whereas the water around reefs is poor absolutely — close to a biological desert. That asymmetry is the stated flaw in the analogy. B is true of reefs but is presented as how reefs cope, not as why the analogy fails.',
    take:'When a question quotes the author\'s own criticism, find the sentence containing the contrast word — here "but" — and answer from it directly.' },
  { id:'rc4', exam:'GRE', section:'Verbal', type:'RC', topic:'Reading comprehension', d:5, passage:'coral',
    stem:'It can be inferred from the passage that an assessment of reef recovery based solely on the percentage of living coral cover would be',
    choices:[
      'accurate, since coral cover determines nutrient recycling',
      'incomplete, because it would not confirm that the symbiosis had been reestablished',
      'misleading, because coral cover declines even in healthy reefs',
      'premature, because thermal stress events recur unpredictably',
      'unnecessary, because productivity can be measured directly'],
    answer:1,
    explain:'The final sentence states that recovery is governed less by the return of coral cover than by the reestablishment of the symbiosis. A cover-only measure therefore misses the variable that actually matters, making it incomplete. Choice C invents a claim the passage never makes.',
    take:'Inference answers must be forced by the text, not merely consistent with it. Prefer the hedged choice — "incomplete" — over the dramatic one.' },

  { id:'se5', exam:'GRE', section:'Verbal', type:'SE', topic:'Sentence equivalence', d:4,
    stem:'The mayor\'s transit proposal, initially dismissed as ______, won broad support once the ridership projections were published.',
    choices:['quixotic','prudent','impracticable','expedient','popular','urgent'], answer:[0,2],
    explain:'"Dismissed as" plus the later reversal means the early judgment was that it could not work. "Quixotic" and "impracticable" both convey unworkable idealism. "Prudent" and "popular" describe approval, which is what came later.',
    take:'Words signalling the pre-reversal state must be negative here. Choices describing the eventual outcome are placed to catch a timeline misread.' },
  { id:'se6', exam:'GRE', section:'Verbal', type:'SE', topic:'Sentence equivalence', d:4,
    stem:'Though the documentary runs nearly three hours, its pacing is so brisk that it never feels ______.',
    choices:['frenetic','plodding','whimsical','ponderous','abbreviated','coherent'], answer:[1,3],
    explain:'Brisk pacing rules out slowness, so the blank names what the film avoids: dragging. "Plodding" and "ponderous" are synonyms for heavy and slow. "Frenetic" would be a consequence of brisk pacing, not its opposite.',
    take:'"Never feels ___" requires the antonym of the stated quality. Do not fill in the quality itself.' },
  { id:'se7', exam:'GRE', section:'Verbal', type:'SE', topic:'Sentence equivalence', d:3,
    stem:'The committee\'s findings were badly ______ by the revelation that key data had been omitted from the analysis.',
    choices:['corroborated','vitiated','published','undermined','anticipated','delayed'], answer:[1,3],
    explain:'Omitted data damages conclusions. "Vitiated" means spoiled or rendered invalid, and "undermined" means weakened — a matching pair. "Delayed" is possible in a loose sense but has no synonym among the choices.',
    take:'If a word fits the sentence but has no partner, it is wrong. The pair requirement eliminates more choices than meaning alone.' },
  { id:'se8', exam:'GRE', section:'Verbal', type:'SE', topic:'Sentence equivalence', d:4,
    stem:'Her prose is admirably ______: not a single word could be cut without loss.',
    choices:['florid','economical','ambiguous','spare','mannered','tentative'], answer:[1,3],
    explain:'Nothing can be removed, so the writing contains no excess. "Economical" and "spare" both mean stripped to essentials. "Florid" and "mannered" describe ornamentation, the opposite quality.',
    take:'A colon following the blank supplies the definition. Convert that clause into a single adjective before scanning choices.' },
  { id:'se9', exam:'GRE', section:'Verbal', type:'SE', topic:'Sentence equivalence', d:4,
    stem:'The proposal met with a surprisingly ______ reception from the union, whose leaders had promised fierce resistance.',
    choices:['hostile','cordial','tepid','genial','belated','unanimous'], answer:[1,3],
    explain:'The surprise lies in the gap between promised resistance and the actual reception, so the reception was friendly. "Cordial" and "genial" are synonyms. "Hostile" would match the promise and eliminate the surprise; "tepid" means lukewarm, which is not warm.',
    take:'"Surprisingly" flags a contrast with the rest of the sentence. Find the stated expectation and choose its opposite.' },
  { id:'se10', exam:'GRE', section:'Verbal', type:'SE', topic:'Sentence equivalence', d:4,
    stem:'After decades of investigation the mechanism remains ______, resisting every attempt at a full explanation.',
    choices:['trivial','enigmatic','documented','inscrutable','contentious','reproducible'], answer:[1,3],
    explain:'Resisting explanation means it stays mysterious. "Enigmatic" and "inscrutable" are close synonyms for impossible to interpret. "Contentious" means disputed, which is about disagreement rather than obscurity.',
    take:'Distinguish "not understood" from "argued about." SE frequently pairs a genuine synonym with a plausible neighbouring concept.' },
  { id:'se11', exam:'GRE', section:'Verbal', type:'SE', topic:'Sentence equivalence', d:5,
    stem:'The regime\'s propaganda was so ______ that even loyal supporters found it hard to take seriously.',
    choices:['subtle','heavy-handed','sporadic','ham-fisted','costly','effective'], answer:[1,3],
    explain:'If supporters could not take it seriously, it was crudely overdone. "Heavy-handed" and "ham-fisted" both mean clumsy and lacking finesse. "Subtle" and "effective" reverse the meaning.',
    take:'A result clause fixes the blank. "So ___ that even X" means the quality is extreme enough to affect the most sympathetic audience.' },
  { id:'se12', exam:'GRE', section:'Verbal', type:'SE', topic:'Sentence equivalence', d:4,
    stem:'New instruments can detect ______ shifts in the ice sheet that earlier sensors missed entirely.',
    choices:['dramatic','minute','seasonal','infinitesimal','predictable','abrupt'], answer:[1,3],
    explain:'Older equipment missed them, so the shifts are extremely small. "Minute" and "infinitesimal" are synonyms for tiny. "Dramatic" and "abrupt" describe changes that earlier sensors would have caught.',
    take:'Note that "minute" here is the adjective meaning very small, not the unit of time. SE exploits words with two pronunciations.' },

  { id:'rc5', exam:'GRE', section:'Verbal', type:'RC', topic:'Reading comprehension', d:3, passage:'levee',
    stem:'The primary purpose of the passage is to',
    choices:[
      'argue that levees should no longer be built along major rivers',
      'explain how a protective measure can increase the losses it is meant to prevent',
      'compare the effectiveness of levees with that of seat belts and antibiotics',
      'describe the hydrological effects of confining a river to a narrow channel',
      'recommend that floodplain development be prohibited by statute'],
    answer:1,
    explain:'The passage introduces the mechanism, names it the safe development paradox, and closes with the evaluative lesson. Choice A is explicitly rejected in the final sentences, and D describes only the first supporting detail.',
    take:'A passage that names a concept and then draws an implication is explaining, not advocating. Rule out any choice the last paragraph disclaims.' },
  { id:'rc6', exam:'GRE', section:'Verbal', type:'RC', topic:'Reading comprehension', d:4, passage:'levee',
    stem:'The author mentions seat belts and deposit insurance primarily in order to',
    choices:[
      'question whether such measures provide any real protection',
      'suggest that the pattern described extends beyond flood control',
      'identify safeguards more effective than levees',
      'illustrate the difficulty of measuring behavioral change',
      'contrast government policy with private risk management'],
    answer:1,
    explain:'The sentence explicitly says the paradox "is not confined to flood control," and the examples follow as evidence of that generality. The passage never ranks their effectiveness or challenges whether they protect at all.',
    take:'Examples introduced right after a generalizing phrase exist to support the generalization. Their content matters less than their position.' },
  { id:'rc7', exam:'GRE', section:'Verbal', type:'RC', topic:'Reading comprehension', d:5, passage:'levee',
    stem:'It can be inferred that the author would consider which of the following an inadequate way to evaluate a proposed levee?',
    choices:[
      'Estimating the reduction in the annual probability of flooding',
      'Projecting the cost of construction and long-term maintenance',
      'Modeling the increase in water velocity during high flow',
      'Surveying residents about their willingness to relocate',
      'Comparing the design with levees built elsewhere'],
    answer:0,
    explain:'The closing sentence insists that benefits be assessed against induced conduct, not merely against the hazard directly reduced. Measuring only the drop in flood probability is precisely the incomplete approach the author warns against.',
    take:'When a passage ends with "not merely X," expect a question asking which option is X. The answer restates the thing being called insufficient.' },
  { id:'rc8', exam:'GRE', section:'Verbal', type:'RC', topic:'Reading comprehension', d:4, passage:'threads',
    stem:'The passage suggests that later contests over industrial standards',
    choices:[
      'were resolved more quickly than the contest over screw threads',
      'demonstrated that technical superiority ultimately determines adoption',
      'reinforced the conclusion the author draws from the Whitworth episode',
      'involved government regulators rather than private purchasers',
      'produced standards that proved less durable than Whitworth\'s'],
    answer:2,
    explain:'The final clause says later contests "would repeatedly confirm" the lesson about market power. Choice B states the opposite of the author\'s thesis, and the passage gives no information about speed, regulators, or durability.',
    take:'A trailing clause about later events almost always generalizes the argument. Choices adding unstated specifics are out of scope.' },

  { id:'tc18', exam:'GRE', section:'Verbal', type:'TC', topic:'Text completion', d:4,
    stem:'The biographer is admirably ______: she neither excuses her subject\'s cruelties nor allows them to eclipse his achievements.',
    choices:['evenhanded','reverential','censorious','evasive','exhaustive'], answer:0,
    explain:'The colon defines the blank as balanced treatment of good and bad. "Evenhanded" captures exactly that. "Reverential" and "censorious" each pick one side, which is what the sentence rules out.',
    take:'When a sentence describes avoiding two opposite errors, the blank names the balance point between them.' },
  { id:'tc19', exam:'GRE', section:'Verbal', type:'TC', topic:'Text completion', d:5,
    stem:'What made the reforms (i)______ was not their content, which was modest, but their timing: arriving amid a fiscal crisis, they appeared to (ii)______ a panic they were in fact designed to contain.',
    blanks:[
      { label:'Blank (i)', choices:['contentious','popular','technical'], answer:0 },
      { label:'Blank (ii)', choices:['confirm','avert','conceal'], answer:0 },
    ],
    explain:'"Not their content but their timing" explains why the reforms drew trouble, so blank (i) is "contentious." The contrast with "designed to contain" means they seemed to validate the panic: "confirm." "Avert" would match the design, not the appearance.',
    take:'"Appeared to X but were designed to Y" makes X and Y opposites. Let the second half fix the first.' },
  { id:'tc20', exam:'GRE', section:'Verbal', type:'TC', topic:'Text completion', d:4,
    stem:'Her early papers were dismissed as ______, but the field eventually adopted the very framework reviewers had found so implausible.',
    choices:['fanciful','derivative','pedestrian','meticulous','conventional'], answer:0,
    explain:'Reviewers found the framework implausible, so the dismissal charged her with inventing something far-fetched. "Fanciful" matches. "Derivative", "pedestrian", and "conventional" all charge the opposite fault — being too ordinary.',
    take:'Match the blank to the specific criticism named later in the sentence, not to any generic insult.' },
  { id:'tc21', exam:'GRE', section:'Verbal', type:'TC', topic:'Text completion', d:5,
    stem:'The archive is (i)______ to the point of (ii)______: it preserves every draft, receipt, and laundry list, leaving researchers to (iii)______ significance from an undifferentiated mass.',
    blanks:[
      { label:'Blank (i)', choices:['comprehensive','selective','disordered'], answer:0 },
      { label:'Blank (ii)', choices:['uselessness','elegance','brevity'], answer:0 },
      { label:'Blank (iii)', choices:['extract','impose','withhold'], answer:0 },
    ],
    explain:'Preserving everything makes the archive "comprehensive." "To the point of ___" names the excess that completeness becomes: "uselessness." Researchers must pull meaning out of the mass: "extract." "Impose" would mean inventing significance rather than finding it.',
    take:'"X to the point of Y" means Y is X taken too far — a flaw, not a virtue.' },
  { id:'tc22', exam:'GRE', section:'Verbal', type:'TC', topic:'Text completion', d:3,
    stem:'Though the two theories make identical predictions, physicists have not treated them as ______, preferring the one whose assumptions seem less arbitrary.',
    choices:['equivalent','incompatible','testable','provisional','obsolete'], answer:0,
    explain:'Identical predictions would ordinarily make theories interchangeable, and "though" signals that physicists resisted that conclusion. "Equivalent" is the word being denied. "Incompatible" reverses the setup entirely.',
    take:'After "though", the blank states what the first clause would normally imply — and the sentence then denies it.' },

  { id:'se13', exam:'GRE', section:'Verbal', type:'SE', topic:'Sentence equivalence', d:4,
    stem:'The negotiators were ______ in their demands, refusing to yield on even the smallest procedural point.',
    choices:['adamant','flexible','intransigent','courteous','ambivalent','impulsive'], answer:[0,2],
    explain:'Refusing to yield at all means immovable. "Adamant" and "intransigent" are synonyms for unyielding. "Flexible" is the opposite, and "courteous" describes manner rather than position.',
    take:'The clause after the comma defines the blank. Convert "refusing to yield" into one adjective before scanning.' },
  { id:'se14', exam:'GRE', section:'Verbal', type:'SE', topic:'Sentence equivalence', d:5,
    stem:'For all its technical brilliance, the building is ______ — it ignores the street, the weather, and everyone who must actually use it.',
    choices:['inspired','solipsistic','durable','self-absorbed','economical','derivative'], answer:[1,3],
    explain:'Ignoring context and users means the building attends only to itself. "Solipsistic" and "self-absorbed" both convey that inward focus. "Derivative" would mean copying others, which is nearly the reverse charge.',
    take:'"For all its X" concedes a virtue before naming the flaw. The blank is always the flaw.' },
  { id:'se15', exam:'GRE', section:'Verbal', type:'SE', topic:'Sentence equivalence', d:4,
    stem:'The minister\'s answer was so ______ that reporters left the briefing unsure whether a policy had changed at all.',
    choices:['equivocal','emphatic','ambiguous','lengthy','candid','hostile'], answer:[0,2],
    explain:'Reporters could not determine the meaning, so the answer admitted more than one reading. "Equivocal" and "ambiguous" are direct synonyms. "Lengthy" describes size, and "candid" reverses the meaning.',
    take:'Distinguish unclear from merely long or unfriendly. SE plants adjacent qualities that do not actually pair.' },
  { id:'se16', exam:'GRE', section:'Verbal', type:'SE', topic:'Sentence equivalence', d:5,
    stem:'Once ______ by the discipline, his statistical methods are now taught in the introductory course.',
    choices:['spurned','refined','disparaged','adopted','anticipated','funded'], answer:[0,2],
    explain:'"Once … now standard" is a reversal, so the blank means rejected. "Spurned" and "disparaged" both convey scornful rejection. "Adopted" matches the present state, which is the timeline trap.',
    take:'On "once … now" reversals, at least one wrong choice always describes the current state instead of the former one.' },

  { id:'rc9', exam:'GRE', section:'Verbal', type:'RC', topic:'Reading comprehension', d:5, passage:'coral',
    stem:'The passage suggests that a reef in which coral cover had substantially returned but symbiotic algae had not would most likely be',
    choices:[
      'more productive than before the thermal stress event',
      'indistinguishable from a fully recovered reef',
      'still unable to sustain its former productivity',
      'permanently incapable of any recovery',
      'better protected against future thermal stress'],
    answer:2,
    explain:'The passage attributes reef productivity to tight internal recycling performed by the symbiotic algae, and says recovery is governed by reestablishing that symbiosis. Coral cover without the algae would leave the recycling loop severed. Choice D overstates — the passage allows that recovery occurs.',
    take:'Hypothetical questions ask you to apply the stated mechanism. Identify which component the scenario removes, then trace what it was responsible for.' },
  { id:'rc10', exam:'GRE', section:'Verbal', type:'RC', topic:'Reading comprehension', d:4, passage:'levee',
    stem:'The author\'s attitude toward levees is best described as',
    choices:[
      'unqualified opposition',
      'enthusiastic endorsement',
      'acceptance coupled with concern about second-order effects',
      'indifference to their engineering merits',
      'skepticism that they reduce flood frequency at all'],
    answer:2,
    explain:'The passage concedes that levees reduce flood frequency and explicitly declines to say protective measures should be abandoned, while insisting that induced behavior be counted. That is acceptance with a caveat. Choice E contradicts the opening sentence.',
    take:'Attitude questions rarely land on extremes. A stated concession plus a stated reservation points to the measured middle choice.' },
  { id:'rc11', exam:'GRE', section:'Verbal', type:'RC', topic:'Reading comprehension', d:5, passage:'threads',
    stem:'Which of the following, if true, would most undermine the author\'s explanation of why Whitworth\'s system prevailed?',
    choices:[
      'Whitworth published his proposal several years before the railways adopted it.',
      'Rival thread forms were manufactured in smaller quantities than Whitworth\'s.',
      'Independent workshops with no railway contracts adopted the standard before the railways did.',
      'The railways later abandoned the standard in favor of a metric system.',
      'Whitworth held patents on the machine tools used to cut his threads.'],
    answer:2,
    explain:'The author\'s claim is that railway purchasing power drove adoption. Widespread uptake by workshops with no railway relationship, and before the railways acted, would show the diffusion had another source. Choice D concerns a later period and leaves the original explanation intact.',
    take:'To undermine a causal explanation, find the choice showing the effect occurred without the proposed cause — or before it.' },

  /* ---------- GMAT DATA SUFFICIENCY ---------- */
  { id:'ds1', exam:'GMAT', section:'Data Insights', type:'DS', topic:'Data sufficiency', d:2,
    stem:'Is x > 0?  \n(1) x² > 4  \n(2) x³ > 0',
    answer:1,
    explain:'Statement 1: x² > 4 means x > 2 or x < −2, so x could be 3 or −3. Not sufficient. Statement 2: an odd power preserves sign, so x³ > 0 forces x > 0. Sufficient alone. Answer: statement 2 alone.',
    take:'Even powers destroy sign information; odd powers preserve it. That single distinction resolves a large share of DS inequality questions.' },
  { id:'ds2', exam:'GMAT', section:'Data Insights', type:'DS', topic:'Data sufficiency', d:4,
    stem:'What is the value of the integer n?  \n(1) n is a prime number between 10 and 20.  \n(2) When n is divided by 6, the remainder is 1.',
    answer:4,
    explain:'Statement 1 allows 11, 13, 17, 19. Statement 2 allows 7, 13, 19, 25, and more. Together the survivors are 13 and 19 — both prime, both leaving remainder 1. Two values remain, so even combined the statements are insufficient.',
    take:'Do not stop at the first value that satisfies both statements. On "what is the value" questions, actively hunt for a second one before choosing C.' },
  { id:'ds3', exam:'GMAT', section:'Data Insights', type:'DS', topic:'Data sufficiency', d:3,
    stem:'Is quadrilateral ABCD a rectangle?  \n(1) All four interior angles of ABCD are equal.  \n(2) The diagonals of ABCD are equal in length.',
    answer:0,
    explain:'Statement 1: four equal angles summing to 360° makes each 90°, which is the definition of a rectangle. Sufficient. Statement 2: an isosceles trapezoid also has equal diagonals, so this does not settle it. Answer: statement 1 alone.',
    take:'For yes/no geometry, try to build one counterexample. If you can draw a non-rectangle satisfying the statement, it is insufficient — no further work needed.' },
  { id:'ds4', exam:'GMAT', section:'Data Insights', type:'DS', topic:'Data sufficiency', d:3,
    stem:'A store sold x shirts at $20 each and y shirts at $30 each. What is x?  \n(1) x + y = 50  \n(2) Total revenue from these shirts was $1,200.',
    answer:2,
    explain:'Each statement alone leaves two unknowns in one equation. Together: 20x + 30(50 − x) = 1200 → 1500 − 10x = 1200 → x = 30. Sufficient only in combination.',
    take:'Two distinct linear equations in two unknowns are sufficient. Confirm the equations are truly independent — a restatement of the same relationship is not a second equation.' },
  { id:'ds5', exam:'GMAT', section:'Data Insights', type:'DS', topic:'Data sufficiency', d:3,
    stem:'What is the average (arithmetic mean) of a, b, and c?  \n(1) a + c = 2b  \n(2) b = 10',
    answer:2,
    explain:'Statement 1 gives a relationship but no values. Statement 2 gives b but says nothing about a and c. Together, a + b + c = 2b + b = 3b = 30, so the average is 30/3 = 10. Sufficient combined.',
    take:'For averages you need the sum, not the individual values. Any statement that yields the total is sufficient even if every term stays unknown.' },
  { id:'ds6', exam:'GMAT', section:'Data Insights', type:'DS', topic:'Data sufficiency', d:3,
    stem:'Is the positive integer n divisible by 12?  \n(1) n is divisible by 4.  \n(2) n is divisible by 6.',
    answer:2,
    explain:'Alone, 4 allows n = 8 and 6 allows n = 18, neither divisible by 12. Together, n must be divisible by LCM(4,6) = 12. Sufficient combined.',
    take:'Combine divisibility rules with the LCM, not the product. Divisible by 4 and 6 means divisible by 12, not 24.' },

  { id:'ds7', exam:'GMAT', section:'Data Insights', type:'DS', topic:'Data sufficiency', d:2,
    stem:'What is the value of x?  \n(1) x² = 16  \n(2) x > 0',
    answer:2,
    explain:'Statement 1 allows x = 4 or x = −4. Statement 2 alone gives no value at all. Together, x must be 4. Sufficient only in combination.',
    take:'A squared variable always carries two roots. A sign restriction is the standard second statement that resolves it.' },
  { id:'ds8', exam:'GMAT', section:'Data Insights', type:'DS', topic:'Data sufficiency', d:3,
    stem:'Is the integer n even?  \n(1) n² is even  \n(2) n + 1 is odd',
    answer:3,
    explain:'Statement 1: an even square forces an even root, since odd × odd is always odd. Sufficient. Statement 2: if n + 1 is odd then n is even. Sufficient. Each statement works alone.',
    take:'Parity propagates through powers: n and nᵏ always share parity. That makes many parity statements sufficient on their own.' },
  { id:'ds9', exam:'GMAT', section:'Data Insights', type:'DS', topic:'Data sufficiency', d:4,
    stem:'A rectangle has an area of 24. What is its perimeter?  \n(1) The length is 6.  \n(2) The length is twice the width.',
    answer:3,
    explain:'Statement 1: width = 24/6 = 4, so perimeter = 20. Sufficient. Statement 2: 2w × w = 24 gives w = √12, length = 2√12, and the perimeter is determined even though it is irrational. Sufficient. Each alone works.',
    take:'Sufficiency means the value is pinned down, not that it is a friendly number. Do not reject a statement because the arithmetic is ugly.' },
  { id:'ds10', exam:'GMAT', section:'Data Insights', type:'DS', topic:'Data sufficiency', d:2,
    stem:'What is the value of x + y?  \n(1) 2x + 2y = 14  \n(2) x − y = 3',
    answer:0,
    explain:'Statement 1 divides by 2 to give x + y = 7 directly. Sufficient. Statement 2 gives the difference, which is consistent with infinitely many sums. Statement 1 alone.',
    take:'DS asks for the combined expression, not the individual variables. One equation is often enough when the target is a combination.' },
  { id:'ds11', exam:'GMAT', section:'Data Insights', type:'DS', topic:'Data sufficiency', d:5,
    stem:'Is the average of a list of 5 numbers greater than 10?  \n(1) The median is 12.  \n(2) The smallest number is 8.',
    answer:2,
    explain:'Statement 1 alone fails: 1, 2, 12, 13, 14 averages 8.4. Statement 2 alone fails: all five equal to 8 averages 8. Together, the two values below the median are at least 8 and the two above are at least 12, so the minimum sum is 8 + 8 + 12 + 12 + 12 = 52, an average of 10.4. Always above 10.',
    take:'For yes/no questions, test the worst case. If even the minimum clears the threshold, the statements are sufficient.' },
  { id:'ds12', exam:'GMAT', section:'Data Insights', type:'DS', topic:'Data sufficiency', d:3,
    stem:'If x and y are positive integers, is xy even?  \n(1) x + y is odd  \n(2) x − y is odd',
    answer:3,
    explain:'An odd sum requires one even and one odd number, so the product contains a factor of 2. Sufficient. An odd difference requires the same mixed parity. Also sufficient. Each alone.',
    take:'Sum and difference carry identical parity information. If one statement is sufficient on parity grounds, check whether the other says the same thing in disguise.' },
  { id:'ds13', exam:'GMAT', section:'Data Insights', type:'DS', topic:'Data sufficiency', d:4,
    stem:'By what percent did the company\'s profit increase last year?  \n(1) Revenue rose by 20%.  \n(2) Costs fell by 10%.',
    answer:4,
    explain:'Profit equals revenue minus costs, so the percent change in profit depends on the starting ratio of revenue to costs. With revenue 100 and costs 90, profit goes from 10 to 39. With revenue 100 and costs 50, profit goes from 50 to 75. Different answers, so even together the statements fail.',
    take:'Percent changes in components do not determine the percent change in their difference. You need the base amounts or their ratio.' },
  { id:'ds14', exam:'GMAT', section:'Data Insights', type:'DS', topic:'Data sufficiency', d:4,
    stem:'If n is a positive integer, what is the units digit of 7ⁿ?  \n(1) n is a multiple of 4.  \n(2) n > 3',
    answer:0,
    explain:'Units digits of powers of 7 cycle 7, 9, 3, 1. Statement 1 places n at the end of the cycle every time, giving units digit 1. Sufficient. Statement 2 allows n = 4 or n = 5, which give different digits. Statement 1 alone.',
    take:'A statement fixing the exponent\'s remainder modulo the cycle length is sufficient. The actual size of the exponent never matters.' },
  { id:'ds15', exam:'GMAT', section:'Data Insights', type:'DS', topic:'Data sufficiency', d:2,
    stem:'Is triangle ABC isosceles?  \n(1) Angle A equals angle B.  \n(2) AB = 5 and BC = 5',
    answer:3,
    explain:'Two equal angles force the opposite sides to be equal, making the triangle isosceles. Sufficient. Two equal sides satisfy the definition directly. Sufficient. Each alone.',
    take:'Equal angles and equal sides are interchangeable evidence for isosceles. Recognize the angle version as the same fact restated.' },
  { id:'ds16', exam:'GMAT', section:'Data Insights', type:'DS', topic:'Data sufficiency', d:3,
    stem:'In a sequence, each term after the first is 3 greater than the term before it. What is the 10th term?  \n(1) The first term is 4.  \n(2) The sum of the first two terms is 11.',
    answer:3,
    explain:'Statement 1: the 10th term is 4 + 9(3) = 31. Sufficient. Statement 2: a + (a + 3) = 11 gives a = 4, the same starting point. Sufficient. Each alone.',
    take:'Any statement that pins the first term of a defined arithmetic sequence is sufficient. Check whether a statement is the first term in disguise.' },

  { id:'ds17', exam:'GMAT', section:'Data Insights', type:'DS', topic:'Data sufficiency', d:4,
    stem:'Is x > y?  \n(1) x² > y²  \n(2) x − y > 0',
    answer:1,
    explain:'Statement 1 fails: x = −3 and y = 2 gives 9 > 4 but x < y. Statement 2 rearranges directly to x > y. Sufficient alone.',
    take:'Squaring destroys order information for negatives. Only a statement about the difference itself preserves the comparison.' },
  { id:'ds18', exam:'GMAT', section:'Data Insights', type:'DS', topic:'Data sufficiency', d:4,
    stem:'What is the value of |x − 3|?  \n(1) x² = 25  \n(2) x > 0',
    answer:2,
    explain:'Statement 1 allows x = 5 or x = −5, giving |x − 3| of 2 or 8. Statement 2 alone gives no value. Together x = 5 and the expression equals 2.',
    take:'An absolute value inside a question still needs the variable pinned down. Two candidate roots means insufficient unless a sign statement narrows them.' },
  { id:'ds19', exam:'GMAT', section:'Data Insights', type:'DS', topic:'Data sufficiency', d:5,
    stem:'If n is a positive integer, is n divisible by 9?  \n(1) The sum of the digits of n is divisible by 3.  \n(2) n is divisible by 6.',
    answer:4,
    explain:'Statement 1 only establishes divisibility by 3. Statement 2 likewise gives 3 and 2 but not 9. Together, n = 12 satisfies both and is not divisible by 9, while n = 18 satisfies both and is. Insufficient even combined.',
    take:'Divisibility by 9 requires the digit sum to be divisible by 9, not 3. The near-miss rule is the whole trap here.' },
  { id:'ds20', exam:'GMAT', section:'Data Insights', type:'DS', topic:'Data sufficiency', d:5,
    stem:'A set of consecutive integers has a sum of 0. How many integers does the set contain?  \n(1) The largest integer in the set is 5.  \n(2) The set contains exactly 6 positive integers.',
    answer:3,
    explain:'A run of consecutive integers summing to zero must be symmetric about 0, running from −k to k. Statement 1 gives k = 5, so the set has 11 members. Statement 2 gives 6 positive members, so k = 6 and the set has 13. Each statement alone determines the count.',
    take:'Consecutive integers summing to zero are always −k through k, a count of 2k + 1. Recognizing the structure makes both statements one-step.' },
  { id:'ds21', exam:'GMAT', section:'Data Insights', type:'DS', topic:'Data sufficiency', d:4,
    stem:'Is quadrilateral PQRS a square?  \n(1) All four sides of PQRS are equal in length.  \n(2) The diagonals of PQRS are equal in length.',
    answer:2,
    explain:'Statement 1 describes a rhombus, which need not have right angles. Statement 2 describes a rectangle or isosceles trapezoid. Together, equal sides plus equal diagonals forces a square. Sufficient combined.',
    take:'Square = rhombus + rectangle. Each statement supplies one half, which is why the answer is C rather than D.' },
  { id:'ds22', exam:'GMAT', section:'Data Insights', type:'DS', topic:'Data sufficiency', d:4,
    stem:'What is the tens digit of the positive integer x?  \n(1) When x is divided by 100, the remainder is 34.  \n(2) When x is divided by 10, the remainder is 4.',
    answer:0,
    explain:'Statement 1 fixes the final two digits as 34, so the tens digit is 3. Sufficient. Statement 2 fixes only the units digit as 4, leaving the tens digit unknown. Statement 1 alone.',
    take:'Remainder on division by 100 pins the last two digits; by 10, only the last one. Match the modulus to the digit position asked for.' },

  /* ---------- GMAT PROBLEM SOLVING ---------- */
  { id:'gp1', exam:'GMAT', section:'Quant', type:'PS', topic:'Mixtures', d:4,
    stem:'A container holds 10 liters of a solution that is 30% alcohol. How many liters of pure alcohol must be added to make the solution 50% alcohol?',
    choices:['2','3','4','5','6'], answer:2,
    explain:'Current alcohol = 3 L. Adding x liters of pure alcohol: (3 + x)/(10 + x) = 0.5 → 6 + 2x = 10 + x → x = 4. Check: 7/14 = 50%.',
    take:'In mixture problems, track the pure component and the total separately. Adding pure solute increases both numerator and denominator — a mistake people make by holding the total fixed.' },
  { id:'gp2', exam:'GMAT', section:'Quant', type:'PS', topic:'Sets', d:3,
    stem:'Of 100 students, 60 take physics and 45 take chemistry. If 20 take both, how many take neither?',
    choices:['5','10','15','20','25'], answer:2,
    explain:'By inclusion-exclusion, students taking at least one = 60 + 45 − 20 = 85. Neither = 100 − 85 = 15.',
    take:'Subtract the overlap exactly once. Adding the two group sizes always double-counts the intersection.' },
  { id:'gp3', exam:'GMAT', section:'Quant', type:'PS', topic:'Rates', d:2,
    stem:'If 12 workers can complete a project in 8 days, how many days would 16 workers take, assuming all work at the same constant rate?',
    choices:['4','5','6','6.5','10.7'], answer:2,
    explain:'The job takes 12 × 8 = 96 worker-days. With 16 workers: 96/16 = 6 days.',
    take:'Convert to worker-days (or machine-hours) immediately. It turns every inverse-proportion problem into one division.' },
  { id:'gp4', exam:'GMAT', section:'Quant', type:'PS', topic:'Percents', d:3,
    stem:'A retailer marks up an item by 50% over cost, then offers a 20% discount off the marked price. The final price represents what percent profit over cost?',
    choices:['10%','20%','25%','30%','35%'], answer:1,
    explain:'Take cost = 100. Marked price = 150. After a 20% discount: 150 × 0.80 = 120. Profit over cost = 20%.',
    take:'Set cost to 100 whenever the problem gives only percentages. It removes the algebra entirely.' },
  { id:'gp5', exam:'GMAT', section:'Quant', type:'PS', topic:'Number properties', d:4,
    stem:'If n is a positive integer and n² is divisible by 72, what is the largest positive integer that must divide n?',
    choices:['6','12','24','36','72'], answer:0,
    explain:'72 = 2³ × 3². Every prime exponent in a perfect square is even, so n² must contain at least 2⁴ and 3², meaning n contains 2² and 3¹ — that is, n is divisible by 12. Verify: n = 12 gives n² = 144, and 144 ÷ 72 = 2. ✓ And 24 fails, since n = 12 is a valid counterexample.',
    take:'In a perfect square every prime exponent is even. Round each required exponent up to the next even number, then halve it to get what n must contain.' },

  { id:'gp6', exam:'GMAT', section:'Quant', type:'PS', topic:'Ratios', d:1,
    stem:'If the ratio of x to y is 3 : 5 and y = 20, what is x?',
    choices:['9','12','15','25','33'], answer:1,
    explain:'x/20 = 3/5, so x = 20 × 3/5 = 12.',
    take:'Set the ratio equal to the actual values and cross-multiply. Matching the correct term to the correct position is the only real risk.' },
  { id:'gp7', exam:'GMAT', section:'Quant', type:'PS', topic:'Rates', d:2,
    stem:'A train travels 240 miles in 4 hours. At the same constant rate, how long will it take to travel 420 miles?',
    choices:['5 hours','6 hours','6.5 hours','7 hours','7.5 hours'], answer:3,
    explain:'Rate = 240/4 = 60 mph. Time = 420/60 = 7 hours.',
    take:'Find the unit rate first. It converts every follow-up question into one division.' },
  { id:'gp8', exam:'GMAT', section:'Quant', type:'PS', topic:'Percents', d:3,
    stem:'If x is 25% of y and y is 40% of z, then x is what percent of z?',
    choices:['6.25%','10%','15%','32.5%','65%'], answer:1,
    explain:'x = 0.25y and y = 0.40z, so x = 0.25 × 0.40 × z = 0.10z, which is 10%. The trap answers come from adding or averaging the percentages.',
    take:'Chained percentages multiply. Setting z = 100 turns the whole problem into two quick multiplications.' },
  { id:'gp9', exam:'GMAT', section:'Quant', type:'PS', topic:'Percents', d:3,
    stem:'A population of 1,000 grows by 10% each year. What is the population after 3 years?',
    choices:['1,300','1,310','1,321','1,331','1,340'], answer:3,
    explain:'1,000 × 1.1³ = 1,000 × 1.331 = 1,331. Simple 10% per year would give 1,300, which is the trap.',
    take:'Memorize 1.1² = 1.21 and 1.1³ = 1.331. Growth questions at 10% recur often enough that recall beats calculation.' },
  { id:'gp10', exam:'GMAT', section:'Quant', type:'PS', topic:'Number properties', d:4,
    stem:'A shipper packs items into boxes holding 12 units each, filling every box completely except possibly the last. If an order contains 500 units, how many units are in the last box?',
    choices:['2','4','6','8','10'], answer:3,
    explain:'500 ÷ 12 = 41 remainder 8, since 41 × 12 = 492 and 500 − 492 = 8. So 41 boxes are full and the last holds 8 units.',
    take:'Remainder questions are plain division. Multiply the quotient back and subtract to confirm — it catches the off-by-one instantly.' },
  { id:'gp11', exam:'GMAT', section:'Quant', type:'PS', topic:'Combinatorics', d:3,
    stem:'Six people at a meeting each shake hands with every other person exactly once. How many handshakes occur?',
    choices:['12','15','18','30','36'], answer:1,
    explain:'Each handshake is a pair, so the count is C(6,2) = (6 × 5)/2 = 15. The value 30 counts each handshake twice.',
    take:'Handshake problems are always combinations of two. The formula n(n−1)/2 handles every version of this question.' },
  { id:'gp12', exam:'GMAT', section:'Quant', type:'PS', topic:'Algebra', d:2,
    stem:'If 3(x − 2) = 2(x + 5), what is x?',
    choices:['4','8','12','16','20'], answer:3,
    explain:'Expand: 3x − 6 = 2x + 10. Subtract 2x and add 6: x = 16.',
    take:'Distribute fully before collecting terms. Most errors in linear equations happen at the distribution step, not the solving step.' },
  { id:'gp13', exam:'GMAT', section:'Quant', type:'PS', topic:'Exponents', d:3,
    stem:'An investment doubles in value every 7 years. By what factor does it grow over 21 years?',
    choices:['3','6','8','14','21'], answer:2,
    explain:'21 years is three doubling periods, so the factor is 2³ = 8. Multiplying the doubling by 3 gives the trap answer.',
    take:'Count the number of doubling periods and raise 2 to that power. Doubling time problems are exponential, never linear.' },
  { id:'gp14', exam:'GMAT', section:'Quant', type:'PS', topic:'Statistics', d:4,
    stem:'The average of 8 numbers is 14. If a ninth number is added and the new average is 15, what is the ninth number?',
    choices:['15','19','21','23','24'], answer:3,
    explain:'Original sum = 8 × 14 = 112. New sum = 9 × 15 = 135. The added number is 135 − 112 = 23.',
    take:'Adding one value shifts the mean by 1 across 9 items, so the newcomer must exceed the new average by 8. That shortcut checks the arithmetic instantly.' },
  { id:'gp15', exam:'GMAT', section:'Quant', type:'PS', topic:'Mixtures', d:4,
    stem:'A 40-liter mixture is 25% acid. How many liters of water must be added to make it 20% acid?',
    choices:['5','8','10','12','15'], answer:2,
    explain:'The acid is fixed at 10 liters. Adding water changes only the total: 10/(40 + x) = 0.20 gives 40 + x = 50, so x = 10.',
    take:'When you add pure solvent, the solute quantity is constant. Anchor the equation on the unchanging component.' },

  { id:'gp16', exam:'GMAT', section:'Quant', type:'PS', topic:'Sets', d:4,
    stem:'How many integers from 1 to 200, inclusive, are divisible by 3 or by 5?',
    choices:['80','86','93','106','120'], answer:2,
    explain:'Multiples of 3: ⌊200/3⌋ = 66. Multiples of 5: ⌊200/5⌋ = 40. Multiples of 15 counted twice: ⌊200/15⌋ = 13. So 66 + 40 − 13 = 93.',
    take:'"Or" means inclusion-exclusion, and the overlap is the LCM. Use floor division rather than listing.' },
  { id:'gp17', exam:'GMAT', section:'Quant', type:'PS', topic:'Percents', d:4,
    stem:'If x is 20% greater than y, and y is 20% less than z, then x is what percent of z?',
    choices:['96%','98%','100%','104%','120%'], answer:0,
    explain:'x = 1.20y and y = 0.80z, so x = 1.20 × 0.80 × z = 0.96z, which is 96%. The offsetting percentages do not cancel because they apply to different bases.',
    take:'Chain the multipliers in the order given. Up 20% then down 20% always lands at 96%, never 100%.' },
  { id:'gp18', exam:'GMAT', section:'Quant', type:'PS', topic:'Percents', d:5,
    stem:'A retailer\'s profit is 20% of the selling price. If the item costs the retailer $60, what is the selling price?',
    choices:['$68','$72','$75','$78','$80'], answer:2,
    explain:'Let S be the selling price. Profit = S − 60 = 0.20S, so 0.80S = 60 and S = $75. Marking up cost by 20% would give $72, the trap answer.',
    take:'Read whether the margin is on cost or on selling price. Margin on price means cost is the remaining fraction, so divide rather than multiply.' },
  { id:'gp19', exam:'GMAT', section:'Quant', type:'PS', topic:'Sequences', d:5,
    stem:'An arithmetic sequence begins at 7 and increases by 5 each term. How many terms are needed for the sum to reach 414?',
    choices:['9','10','11','12','14'], answer:3,
    explain:'The nth term is 7 + 5(n − 1). Sum = n(first + last)/2. Testing n = 12: last term = 7 + 55 = 62, sum = 12(7 + 62)/2 = 12 × 34.5 = 414. ✓',
    take:'Sum = count × average of first and last. Testing answer choices against that formula beats solving the quadratic.' },
  { id:'gp20', exam:'GMAT', section:'Quant', type:'PS', topic:'Statistics', d:4,
    stem:'The average of five consecutive integers is 17. What is the average of the smallest and largest of them?',
    choices:['15','16','17','18','19'], answer:2,
    explain:'The integers are 15, 16, 17, 18, 19. The average of 15 and 19 is 17 — the same as the overall mean, because any evenly spaced set is symmetric about its center.',
    take:'In an evenly spaced set, the mean, the median, and the average of the endpoints are all the same number.' },
  { id:'gp21', exam:'GMAT', section:'Quant', type:'PS', topic:'Rates', d:4,
    stem:'A rental car costs $30 per day plus $0.20 per mile. If a three-day rental cost $126, how many miles were driven?',
    choices:['120','150','180','200','240'], answer:2,
    explain:'Fixed cost = 3 × $30 = $90. The remaining $36 is mileage: 36/0.20 = 180 miles.',
    take:'Strip out the fixed component first, then divide the remainder by the variable rate. Two-part pricing questions all reduce to this.' },

  /* ---------- GMAT CRITICAL REASONING ---------- */
  { id:'cr1', exam:'GMAT', section:'Verbal', type:'CR', topic:'Critical reasoning', d:3,
    stem:'A city installed automated cameras at its busiest intersections. In the following year, collisions at those intersections fell by 30 percent. City officials concluded that the cameras caused the decline.\n\nWhich of the following, if true, most seriously weakens the officials\' conclusion?',
    choices:[
      'Some drivers reported feeling more anxious when approaching camera-equipped intersections.',
      'In the same year, the city lowered the speed limit on every major road, including those at the camera intersections.',
      'The cameras cost more to install and maintain than the city had originally budgeted.',
      'Collisions at intersections without cameras fell by 2 percent during the same period.',
      'The cameras record violations only during daylight hours.'],
    answer:1,
    explain:'A causal conclusion from a correlation is weakened by an alternative cause operating at the same time and place. A citywide speed-limit reduction is exactly that. Choice D actually strengthens the argument by showing camera intersections improved far more than others. Cost and driver anxiety are irrelevant to causation.',
    take:'To weaken a causal claim, supply a rival cause, reverse the causation, or show the correlation is coincidental. Cost and feasibility objections are almost never the answer.' },
  { id:'cr2', exam:'GMAT', section:'Verbal', type:'CR', topic:'Critical reasoning', d:4,
    stem:'Blenheim Corporation plans to eliminate its office lease by moving entirely to remote work. Since the lease is the company\'s largest fixed expense, management concludes that total operating expenses will fall substantially.\n\nThe conclusion depends on which of the following assumptions?',
    choices:[
      'Employees prefer working remotely to working in an office.',
      'The company will not incur new costs from remote work that offset most of the lease savings.',
      'No competitor of Blenheim has adopted a remote work policy.',
      'The office lease could not have been renegotiated at a lower rate.',
      'Remote employees will be at least as productive as office employees.'],
    answer:1,
    explain:'The conclusion is about total expenses, but the evidence only removes one expense. It therefore assumes no large new expenses appear — equipment stipends, software, distributed IT support. Negate B and the conclusion collapses, which is the test of a necessary assumption. Productivity and preference concern a different conclusion.',
    take:'Use the negation test: negate the choice and see whether the conclusion dies. And watch the scope shift — evidence about one cost, conclusion about total costs.' },
  { id:'cr3', exam:'GMAT', section:'Verbal', type:'CR', topic:'Critical reasoning', d:4,
    stem:'A survey found that adults who eat breakfast daily weigh less on average than adults who skip breakfast. A nutritionist concluded that eating breakfast helps prevent weight gain.\n\nWhich of the following, if true, most strengthens the nutritionist\'s conclusion?',
    choices:[
      'Breakfast foods are generally less expensive than lunch or dinner foods.',
      'People who eat breakfast report feeling more alert during the morning.',
      'In a controlled trial, participants randomly assigned to eat breakfast lost more weight over six months than those assigned to skip it.',
      'The survey included adults from a wide range of income levels.',
      'Many people who skip breakfast consume a larger lunch.'],
    answer:2,
    explain:'The gap is that the survey is observational — breakfast eaters may differ in other habits. A randomized controlled trial removes self-selection and shows the effect under assignment, which is the strongest possible support. Choice E suggests a compensating mechanism that would work against the conclusion.',
    take:'The strongest strengthener for a causal claim from observational data is a controlled experiment. Look for the choice that eliminates self-selection.' },
  { id:'cr4', exam:'GMAT', section:'Verbal', type:'CR', topic:'Critical reasoning', d:4,
    stem:'Every tested sample of alloy X that failed under stress contained trace sulfur. No tested sample free of sulfur failed.\n\nWhich of the following must be true on the basis of the statements above?',
    choices:[
      'Trace sulfur is what causes alloy X to fail under stress.',
      'Any sample of alloy X containing trace sulfur will fail under stress.',
      'Among the tested samples, no failure occurred in the absence of trace sulfur.',
      'Removing sulfur from alloy X would eliminate all structural failures.',
      'Sulfur-free samples of alloy X are stronger than samples containing sulfur.'],
    answer:2,
    explain:'The statements report only what happened among tested samples, and only that sulfur was present in every failure. Choice C restates that without adding anything. A asserts causation the evidence cannot establish; B reverses the conditional — sulfur present does not guarantee failure; D and E generalize beyond the tested set.',
    take:'On "must be true," the answer is usually a modest restatement. Any choice that adds causation, a guarantee, or a prediction beyond the data is wrong.' },
  { id:'cr5', exam:'GMAT', section:'Verbal', type:'CR', topic:'Critical reasoning', d:5,
    stem:'To reduce emergency room crowding, Meridian Hospital opened an adjacent urgent care clinic for non-emergency cases. One year later, emergency room visits had not decreased at all. Administrators concluded that patients are unwilling to use urgent care clinics.\n\nWhich of the following, if true, most seriously undermines the administrators\' conclusion?',
    choices:[
      'The urgent care clinic operates on a shorter daily schedule than the emergency room.',
      'The clinic treated 9,000 patients in its first year, nearly all of whom had never previously visited the hospital.',
      'Several other hospitals in the region opened similar clinics during the same year.',
      'The emergency room hired additional staff during the same period.',
      'Urgent care visits cost patients less on average than emergency room visits.'],
    answer:1,
    explain:'If the clinic served 9,000 patients who were not previously coming to the emergency room, then patients clearly are willing to use urgent care — the clinic drew new demand rather than diverting existing demand. That explains the flat ER numbers without the administrators\' interpretation. Choice A explains the flat numbers but is consistent with unwillingness, so it undermines less directly.',
    take:'When a program shows no effect, ask whether it attracted a new population instead of shifting the old one. The absence of a change in one number rarely licenses a claim about willingness.' },

  { id:'cr6', exam:'GMAT', section:'Verbal', type:'CR', topic:'Critical reasoning', d:3,
    stem:'After a restaurant added a range of low-calorie entrées to its menu, dessert sales fell by 22 percent. The owner concluded that customers had become more health-conscious.\n\nWhich of the following, if true, most weakens the owner\'s conclusion?',
    choices:[
      'The low-calorie entrées were more expensive than the dishes they replaced.',
      'The restaurant raised its dessert prices by 40 percent in the same month.',
      'Some customers ordered the low-calorie entrées only once.',
      'Dessert sales at nearby restaurants rose slightly during the same period.',
      'The restaurant\'s total revenue increased over the period.'],
    answer:1,
    explain:'A simultaneous 40 percent price increase supplies an alternative explanation for the drop that has nothing to do with health consciousness. Choice D would strengthen the argument by showing the decline was specific to this restaurant.',
    take:'Look for a second change that happened at the same time. Concurrent price changes are the most common alternative cause in sales-based arguments.' },
  { id:'cr7', exam:'GMAT', section:'Verbal', type:'CR', topic:'Critical reasoning', d:4,
    stem:'The city will save money by replacing its sodium streetlights with LED fixtures, because LEDs consume 60 percent less electricity than the lights they replace.\n\nThe argument depends on which of the following assumptions?',
    choices:[
      'LED fixtures produce light of a color residents prefer.',
      'No other municipality has attempted a similar replacement.',
      'The cost of purchasing and installing the LEDs will not exceed the electricity savings over their service life.',
      'Electricity rates in the city will not decline in the coming years.',
      'The sodium fixtures currently in use are near the end of their service life.'],
    answer:2,
    explain:'The conclusion is about money saved overall, but the evidence covers only electricity consumption. If capital and installation costs swallow the savings, the city saves nothing. Negating C destroys the conclusion, which is the test of a necessary assumption.',
    take:'Watch for a scope shift from one cost category to total cost. The assumption almost always closes that specific gap.' },
  { id:'cr8', exam:'GMAT', section:'Verbal', type:'CR', topic:'Critical reasoning', d:4,
    stem:'A manufacturer introduced a safety training program at its Akron plant. Over the following year, reportable injuries at Akron fell by 18 percent. Management concluded that the training reduced injuries.\n\nWhich of the following, if true, most strengthens the conclusion?',
    choices:[
      'Workers at Akron rated the training highly in an anonymous survey.',
      'Injury rates at the company\'s three comparable plants, which received no training, held steady over the same year.',
      'The training program cost less than the company had budgeted.',
      'Akron had the highest injury rate of any plant before the training began.',
      'Some Akron workers had received similar training at previous employers.'],
    answer:1,
    explain:'A control group that did not change rules out industry-wide or seasonal explanations, isolating the training as the difference. Choice D actually weakens the argument by raising regression to the mean — the worst performer tends to improve regardless.',
    take:'The strongest causal strengthener is a comparison group that lacked the intervention and showed no change.' },
  { id:'cr9', exam:'GMAT', section:'Verbal', type:'CR', topic:'Critical reasoning', d:4,
    stem:'Every employee who received a bonus this quarter exceeded their sales quota. However, some employees who exceeded their quota did not receive a bonus.\n\nWhich of the following must be true?',
    choices:[
      'Exceeding the quota guarantees a bonus.',
      'Exceeding the quota is required for a bonus but does not guarantee one.',
      'Most employees who exceeded quota received bonuses.',
      'The bonus criteria were applied inconsistently.',
      'Employees who missed quota were penalized.'],
    answer:1,
    explain:'The first sentence makes exceeding quota a necessary condition for a bonus. The second shows it is not sufficient. Choice D assumes unfairness the statements never establish — other criteria may exist. Choice C makes a quantitative claim the text does not support.',
    take:'"All A are B" makes B necessary for A, not sufficient. The reversal is the single most tested logical error on the GMAT.' },
  { id:'cr10', exam:'GMAT', section:'Verbal', type:'CR', topic:'Critical reasoning', d:3,
    stem:'A survey published in a cycling magazine found that 82 percent of respondents support building protected bike lanes downtown. The magazine concluded that most residents of the city support the proposal.\n\nThe reasoning is most vulnerable to the criticism that it',
    choices:[
      'relies on a sample unlikely to represent the population it describes',
      'confuses a correlation with a causal relationship',
      'assumes without evidence that bike lanes reduce traffic accidents',
      'fails to define what counts as a protected bike lane',
      'draws a conclusion about the future from evidence about the past'],
    answer:0,
    explain:'Readers of a cycling magazine are far more likely than average residents to favor bike infrastructure, so the sample is self-selected and biased toward the conclusion. No causal claim is made, which rules out B.',
    take:'Check where the sample came from. A survey drawn from an interested group cannot support a claim about the general population.' },
  { id:'cr11', exam:'GMAT', section:'Verbal', type:'CR', topic:'Critical reasoning', d:5,
    stem:'After a regional hospital adopted a new screening protocol, the number of patients diagnosed with a certain disease rose sharply. Yet over the same period, the death rate among patients diagnosed with that disease fell substantially.\n\nWhich of the following, if true, best explains this apparent discrepancy?',
    choices:[
      'The hospital hired additional oncologists during the same period.',
      'The screening protocol detects the disease at earlier stages, including mild cases that previously went undiagnosed and respond well to treatment.',
      'The disease is more common in the region than elsewhere in the country.',
      'The cost of the screening protocol exceeded initial projections.',
      'Some patients declined to undergo the new screening.'],
    answer:1,
    explain:'Adding many mild, treatable cases to the diagnosed pool raises the case count while lowering the average severity, so the death rate among diagnosed patients falls even if no individual outcome improves. This is length-time bias, and it resolves both halves at once.',
    take:'When a rate falls while a count rises, suspect a change in who enters the denominator. Explanations that only address one half of the paradox are wrong.' },
  { id:'cr12', exam:'GMAT', section:'Verbal', type:'CR', topic:'Critical reasoning', d:4,
    stem:'Since installing rooftop solar panels, a factory in Arizona has cut its electricity costs by 40 percent. The panel manufacturer concludes that solar installation would be cost-effective for factories generally.\n\nWhich of the following, if true, most seriously weakens the conclusion?',
    choices:[
      'The factory received a state tax credit covering part of the installation cost.',
      'The factory operates only during daylight hours in one of the sunniest regions in the country.',
      'The panels require cleaning twice a year.',
      'Electricity prices have risen nationally over the past decade.',
      'The factory\'s roof is unusually large relative to its floor space.'],
    answer:1,
    explain:'The conclusion generalizes from a single case, so showing the case is unrepresentative undermines it. Daylight-only operation in an exceptionally sunny region maximizes solar benefit in a way most factories cannot replicate. Choice A is a real factor but applies to many factories through similar programs.',
    take:'To weaken a generalization from one example, attack the representativeness of that example rather than its accuracy.' },
  { id:'cr13', exam:'GMAT', section:'Verbal', type:'CR', topic:'Critical reasoning', d:4,
    stem:'A publisher plans to raise the price of its e-books by 30 percent. Since e-books involve no printing, shipping, or warehousing costs, the publisher expects profits on e-books to rise by roughly 30 percent.\n\nThe argument assumes which of the following?',
    choices:[
      'E-books currently account for the majority of the publisher\'s sales.',
      'The number of e-books sold will not decline enough to offset the higher price.',
      'Competing publishers will raise their e-book prices as well.',
      'Readers prefer e-books to printed books.',
      'The publisher\'s printing costs have risen in recent years.'],
    answer:1,
    explain:'Profit depends on price times volume. The argument reasons entirely from price and silently assumes demand holds up. Negate B — sales collapse — and profits fall rather than rise, which confirms the assumption is necessary.',
    take:'Any argument moving from a price increase to a revenue or profit increase assumes something about quantity demanded. That is nearly always the answer.' },

  /* ---------- GMAT DATA INSIGHTS ---------- */
  { id:'gd1', exam:'GMAT', section:'Data Insights', type:'DI', topic:'Data insights', d:4, table:'ship',
    stem:'Which single center accounts for the largest total Q1 fulfillment cost, and approximately how much is it?',
    choices:['Reno, about $197,000','Toledo, about $207,000','Macon, about $168,000','Toledo, about $185,000','Reno, about $240,000'],
    answer:1,
    explain:'Reno: 48,000 × $4.10 = $196,800. Toledo: 61,000 × $3.40 = $207,400. Macon: 35,000 × $4.80 = $168,000. Toledo is highest despite having the lowest cost per order, because its volume is largest.',
    take:'Total cost is rate times volume. The lowest unit cost frequently belongs to the highest total spender — check both factors before answering.' },
  { id:'gd2', exam:'GMAT', section:'Data Insights', type:'DI', topic:'Data insights', d:4, table:'rev',
    stem:'If Materials revenue continues to decline by the same absolute amount each year as it did from 2022 to 2023, in which year would it first reach zero?',
    choices:['2026','2027','2028','2031','2032'], answer:3,
    explain:'From 2022 to 2023 Materials fell from 45 to 40 — a decline of 5 per year. Model it directly: value = 40 − 5n, which hits zero at n = 8. Adding 8 years to 2023 gives 2031.',
    take:'Write the linear model explicitly — value = start − rate × years — rather than counting down. Counting invites off-by-one errors under time pressure.' },
  { id:'gd3', exam:'GMAT', section:'Data Insights', type:'DI', topic:'Data insights', d:3, table:'grad',
    stem:'Which program admitted the fewest students, and what share of its applicants did that represent?',
    choices:['Civil, about 25%','Industrial, about 25%','Industrial, about 35%','Civil, about 35%','Mechanical, about 35%'],
    answer:2,
    explain:'Industrial admitted 189, the smallest count. Its rate is 189/540 = 35%. Civil admitted more students (252) at the same rate, so the count and the rate point to different programs.',
    take:'Two-part questions want both facts checked separately. Confirm the count first, then compute the rate only for that row.' },
  { id:'gd4', exam:'GMAT', section:'Data Insights', type:'DI', topic:'Data insights', d:4, table:'grad',
    stem:'By how much does the highest program average GRE Quant score exceed the unweighted mean of the four program averages?',
    choices:['1.0','1.5','2.0','2.5','3.0'],
    answer:3,
    explain:'The four averages are 164, 166, 161, and 163, summing to 654 for a mean of 163.5. The highest is Electrical at 166, which exceeds the mean by 2.5.',
    take:'An unweighted mean averages the row values themselves and ignores program size. Read carefully whether the question wants that or a size-weighted figure.' },
  { id:'gd5', exam:'GMAT', section:'Data Insights', type:'DI', topic:'Data insights', d:3, table:'ship',
    stem:'If Toledo raised its on-time rate to 96% while holding order volume constant, approximately how many additional orders would arrive on time?',
    choices:['about 2,400','about 4,880','about 5,400','about 7,300','about 12,200'],
    answer:1,
    explain:'The gain is 8 percentage points on 61,000 orders: 0.08 × 61,000 = 4,880. There is no need to compute either on-time total separately.',
    take:'When only the rate changes, multiply the volume by the change in rate. Computing both totals and subtracting wastes time and invites arithmetic slips.' },
  { id:'gd6', exam:'GMAT', section:'Data Insights', type:'DI', topic:'Data insights', d:5, table:'rev',
    stem:'Software revenue doubled from 2021 to 2023. What was its approximate compound annual growth rate over that two-year span?',
    choices:['33%','41%','50%','67%','100%'],
    answer:1,
    explain:'A doubling over two years means the annual multiplier r satisfies r² = 2, so r = √2 ≈ 1.414 — about 41% per year. The trap is halving the total 100% growth to get 50%, which would compound to 2.25×, overshooting.',
    take:'Compound growth rates never split evenly across periods. Doubling over two years is roughly 41% annually, not 50%.' },
];

const QC_CHOICES = [
  'Quantity A is greater',
  'Quantity B is greater',
  'The two quantities are equal',
  'The relationship cannot be determined from the information given',
];
const DS_CHOICES = [
  'Statement (1) ALONE is sufficient, but statement (2) alone is not',
  'Statement (2) ALONE is sufficient, but statement (1) alone is not',
  'BOTH statements TOGETHER are sufficient, but neither alone is',
  'EACH statement ALONE is sufficient',
  'Statements (1) and (2) TOGETHER are NOT sufficient',
];


/* ============================================================
   LESSONS — the method behind each topic.
   Reachable from any missed question and from the Learn tab.
   Written to be read on a phone in under two minutes.
   ============================================================ */

const LESSONS = {
  'Arithmetic': {
    core: 'These questions test precision, not cleverness. The errors come from decimal placement and inclusive counting, so slow down for one extra second on both.',
    facts: [
      'Convert a percent by moving the decimal two places left. 0.2% is 0.002, not 0.2.',
      'Inclusive counting adds one: from −5 to 7 there are 7 − (−5) + 1 = 13 integers.',
      'Fractions beat decimals for exactness. Convert only at the end.',
      'Estimate first, compute second. A rough answer tells you which choices are impossible.',
      'For 0 < x < 1, squaring shrinks and rooting grows.',
    ],
    example: '0.2% of 500 = 0.002 × 500 = 1. Reading the percent as 0.2 gives 100, which is the planted trap.',
    traps: 'Dropping the +1 in inclusive counts, and misplacing a decimal on sub-1% values.',
  },
  'Number properties': {
    core: 'Almost every number-properties question is really asking about prime factorization, parity, or remainder cycles. Identify which of the three before doing anything else.',
    facts: [
      'Every integer breaks into primes uniquely. Write the factorization first — most questions dissolve once you do.',
      'Divisor count: add 1 to each prime exponent and multiply. 36 = 2²·3² has (2+1)(2+1) = 9 divisors.',
      '"Divisible by both" means divisible by the LCM, not the product.',
      'In a perfect square, every prime exponent is even. This is the key to "what must divide n" questions.',
      'Every prime above 3 has the form 6k ± 1. That single fact cracks most prime-remainder problems.',
      'Remainders of powers cycle, almost always within 4 steps. Compute the first four and find the loop.',
      'Trailing zeros in a factorial are limited by the count of 5s: divide by 5, then 25, then 125, and add.',
    ],
    example: 'Remainder of 7¹⁷ ÷ 5? Powers of 7 give remainders 2, 4, 3, 1 and then repeat. 17 ÷ 4 leaves 1, so the answer matches the first term: 2.',
    traps: '1 is not prime. 2 is the only even prime. "Distinct" prime factors ignores multiplicity.',
  },
  'Algebra': {
    core: 'The exam rarely wants you to solve for the variable. It wants the value of an expression. Look for the target as a combination of what you already have.',
    facts: [
      '(x + y)² = x² + 2xy + y². This converts between sums and products constantly.',
      'x² − y² = (x + y)(x − y). Spotting a difference of squares saves whole minutes.',
      'x³ + y³ = (x + y)³ − 3xy(x + y).',
      'When you see x + 1/x, square it: the cross term is always exactly 2.',
      'Absolute value equations are two equations. Roots are symmetric about the value that zeroes the inside.',
      'Inequalities flip when you multiply or divide by a negative.',
    ],
    example: 'If x + y = 7 and x² + y² = 29, then 49 = 29 + 2xy so xy = 10. You now have the sum and product, which is enough for almost any symmetric expression.',
    traps: 'Solving for x when the question asks for 6x wastes time. Check whether the target is a multiple of the given.',
  },
  'Percents': {
    core: 'Percent changes multiply, never add. Set the starting value to 100 whenever the problem gives you only percentages.',
    facts: [
      'Up x% then down x% always loses. Two 20% moves land at 0.96, not 1.00.',
      'To reverse a percent change, divide by the multiplier. Adding the same percent back undershoots.',
      'Percent increase = change ÷ original. Doubling is +100%, not 200%.',
      '"Percentage points" is subtraction; "percent change" is division. They are different answers.',
      'Margin on cost and margin on selling price are different. Read which one is stated.',
      'Compound growth: value × (1 + r)ⁿ. Memorize 1.1² = 1.21 and 1.1³ = 1.331.',
    ],
    example: 'A shirt sells for $49 after a 30% discount. The sale price is 70% of the original, so P = 49 ÷ 0.7 = $70. Adding 30% to $49 gives $63.70 — the trap.',
    traps: 'The answer equal to the sum or average of the two percentages is nearly always planted.',
  },
  'Ratios': {
    core: 'Convert a ratio into parts and find the value of one part. That single number answers every follow-up the question can ask.',
    facts: [
      'A ratio 5:4 across 36 items means 9 parts, each worth 4.',
      'To chain a:b with b:c, scale both so the shared term hits the LCM of its two values.',
      'Ratios carry no units and no totals. a:b = 3:4 tells you nothing about size.',
      'Check whether an answer choice is your answer unreduced — 18:20 and 9:10 both appear.',
    ],
    example: 'a:b = 3:4 and b:c = 6:5. Scale to b = 12: a:b = 9:12 and b:c = 12:10. So a:b:c = 9:12:10 and a:c = 9:10.',
    traps: 'Matching the wrong term to the wrong position. Write the labels above the numbers.',
  },
  'Rates': {
    core: 'Add rates, not times. Convert to a unit rate or to worker-days, then invert only at the very end.',
    facts: [
      'Combined rate = 1/a + 1/b. Time is the reciprocal of that sum.',
      'Opposing rates (fill and drain) subtract.',
      'Worker-days: 12 workers × 8 days = 96. Any staffing question becomes one division.',
      'Average speed = total distance ÷ total time, never the average of the speeds.',
      'Two-part pricing: strip the fixed cost first, then divide by the variable rate.',
    ],
    example: 'Machine A takes 6 hours, B takes 3. Together: 1/6 + 1/3 = 1/2 job per hour, so 2 hours. Inverting too early gives 4.5 — wrong.',
    traps: 'On round-trip speed questions, the plain average of the two speeds is always an answer choice and always wrong.',
  },
  'Statistics': {
    core: 'Turn every average into a sum immediately. Sums combine and subtract; averages do not.',
    facts: [
      'Sum = average × count. This one line solves most of these.',
      'In any evenly spaced set, mean = median = average of the endpoints.',
      'With an odd count of consecutive terms, the middle term is the mean.',
      'Adding a constant to every value shifts the mean and leaves the standard deviation unchanged.',
      'Multiplying every value by k multiplies the standard deviation by k.',
      'To maximize one member of a fixed-sum set, push every other member to its legal minimum.',
    ],
    example: 'Five numbers average 20, so the sum is 100. Remove one and the remaining four average 18, a sum of 72. The removed value is 28.',
    traps: 'Removing a below-average value must raise the mean. Use that to sanity-check your answer.',
  },
  'Probability': {
    core: 'Decide whether outcomes are ordered, then whether events are independent. Those two answers determine the whole setup.',
    facts: [
      '"At least one" = 1 − P(none). This is faster than summing cases almost every time.',
      'Without replacement, numerator and denominator both drop by one each draw.',
      'Independent events multiply. Mutually exclusive events add. These are different conditions.',
      'Two dice give 36 ordered outcomes. (2,6) and (6,2) are separate.',
      'Complementary events partition the space, so compute whichever side is smaller.',
    ],
    example: 'Rain Saturday 0.4, Sunday 0.5, independent. At least one day = 1 − (0.6 × 0.5) = 0.70. Adding 0.4 + 0.5 double-counts.',
    traps: 'Adding probabilities of events that can both happen. Only mutually exclusive events add.',
  },
  'Combinatorics': {
    core: 'Ask one question: does rearranging the same items create a different outcome? Yes means permutation, no means combination.',
    facts: [
      'Committees, handshakes, and selections are combinations: C(n,k) = n! / (k!(n−k)!).',
      'Handshakes among n people = n(n−1)/2.',
      'Arrangements with repeated letters: divide by the factorial of each repeat count.',
      '"At least" problems: compute the total and subtract the few forbidden cases.',
      'n! / (n−k)! is just the top k consecutive integers multiplied.',
      'Fill the most constrained slot first — a leading digit that cannot be 0, for instance.',
    ],
    example: 'Committees of 4 from 6 men and 5 women with at least 2 women: total C(11,4) = 330, minus 0 women (15) and 1 woman (100), leaving 215.',
    traps: 'Using a permutation where order does not matter inflates the count by k!.',
  },
  'Geometry': {
    core: 'Route everything through the one shared quantity — usually the radius or the side length. You can never jump directly between area and volume.',
    facts: [
      'Special right triangles: 30-60-90 is x : x√3 : 2x; 45-45-90 is x : x : x√2.',
      'Pythagorean triples to recognize on sight: 3-4-5, 5-12-13, 8-15-17, 7-24-25, and their multiples.',
      'Inscribed circle in a square: diameter = side. Circumscribed: diameter = diagonal = side√2.',
      'A chord equal to the radius subtends 60°, forming an equilateral triangle.',
      'Box diagonal = √(l² + w² + h²).',
      'Interior angles of an n-gon sum to (n − 2) × 180.',
      'Fixed perimeter: the square maximizes area. Perimeter never determines area.',
    ],
    example: 'Cube with surface area 96: 6s² = 96, so s = 4 and the volume is 64. You must pass through s.',
    traps: 'The face diagonal is a planted answer on box-diagonal questions.',
  },
  'Coordinate geometry': {
    core: 'Sketch it. Most coordinate questions become one-step once you can see the right angle or the intercept.',
    facts: [
      'Slope = (y₂ − y₁)/(x₂ − x₁). Subtract in the same order top and bottom.',
      'A point with x = 0 hands you the y-intercept directly.',
      'Set y = 0 for the x-intercept, x = 0 for the y-intercept.',
      'Axis-parallel legs mean a right angle, so distances are just coordinate differences.',
      'Parallel lines share a slope; perpendicular slopes multiply to −1.',
    ],
    example: 'Line through (2,3) with negative slope: y = 3 + m(x − 2), so the x-intercept is 2 − 3/m. Negative m makes that greater than 2.',
    traps: 'Reversing subtraction order in only the numerator flips the sign.',
  },
  'Exponents': {
    core: 'Force everything to a common base before touching the exponents. Powers of 2, 3, and 5 are what the test reuses.',
    facts: [
      'a^m · a^n = a^(m+n), and (a^m)^n = a^(mn).',
      'When exponents differ, factor to a common exponent: 2³⁰ = 8¹⁰ and 3²⁰ = 9¹⁰.',
      'Split rather than solve: 2^(x+3) = 2^x · 8.',
      'Doubling time is exponential. Three doubling periods is ×8, not ×3.',
      'For 0 < x < 1: x² < x < √x. The order reverses above 1.',
    ],
    example: '3ˣ · 9ˣ = 27⁴ becomes 3ˣ · 3²ˣ = 3¹², so 3x = 12 and x = 4.',
    traps: 'Multiplying the growth rate by the number of periods instead of compounding.',
  },
  'Sequences': {
    core: 'Count the steps, not the terms. From the first term to the nth there are n − 1 steps.',
    facts: [
      'Arithmetic: aₙ = a₁ + (n − 1)d.',
      'Sum = count × (first + last) ÷ 2.',
      'For n(n+1) = k, take √k and check the two integers around it.',
      'Any statement fixing the first term of a defined sequence determines every term.',
    ],
    example: 'a₁ = 3, difference 4. Then a₂₀ = 3 + 19(4) = 79. Using 20 steps gives 83 — the off-by-one trap.',
    traps: 'Testing answer choices against the sum formula usually beats solving the quadratic.',
  },
  'Sets': {
    core: 'Strip out the "neither" group first, then apply inclusion-exclusion to what remains.',
    facts: [
      'At least one = A + B − both.',
      '"Or" means inclusion-exclusion, and the overlap is the LCM for divisibility questions.',
      'Use floor division for counting multiples rather than listing.',
      'A two-set Venn has four regions: A only, B only, both, neither.',
    ],
    example: '200 integers divisible by 3 or 5: ⌊200/3⌋ = 66, ⌊200/5⌋ = 40, ⌊200/15⌋ = 13. So 66 + 40 − 13 = 93.',
    traps: 'Adding the two group sizes double-counts the intersection exactly once.',
  },
  'Mixtures': {
    core: 'Track the pure component, not the mixture. Anchor your equation on whatever stays constant.',
    facts: [
      'Adding pure solute raises both numerator and denominator.',
      'Adding pure solvent leaves the solute fixed and changes only the total.',
      'Drain-and-replace keeps the volume constant and removes solute proportionally.',
    ],
    example: '40 L at 25% acid holds 10 L of acid. To reach 20%, solve 10/(40 + x) = 0.20, giving x = 10 L of water.',
    traps: 'Holding the total fixed when you are adding volume, or vice versa.',
  },
  'Functions': {
    core: 'Compute the inner value completely before substituting outward. Use parentheses around every negative.',
    facts: [
      'f(g(x)) means evaluate g first.',
      'Square before applying a coefficient: 2(−2)² = 8, not −8.',
      'Some functions undo themselves, so applying twice returns the input.',
    ],
    example: 'f(x) = x/(x−1). Then f(3) = 3/2 and f(3/2) = (3/2)/(1/2) = 3.',
    traps: 'Sign errors on negative inputs are the single most common loss here.',
  },
  'Data interpretation': {
    core: 'Estimate against benchmarks like 1/2, 1/3, and 1/4 before computing. The choices are usually spread far enough apart.',
    facts: [
      'A rate needs its own denominator. Apply each percentage to its own base before comparing.',
      'A combined rate divides the totals; it never averages the individual rates.',
      'A weighted average pulls toward the largest group.',
      'A share can collapse while the underlying value barely moves, if the denominator is growing.',
      '"Cost per successful unit" divides by successes, so it exceeds the headline unit cost.',
      'When only a rate changes, multiply the volume by the change in rate.',
    ],
    example: 'Toledo ships 61,000 at 88% on time; Macon 35,000 at 92%. Toledo delivers far more on time despite the lower rate.',
    traps: 'Answering with the largest count when the question asked for the highest rate.',
  },
  'Data sufficiency': {
    core: 'Never solve further than you must. You are judging whether a unique answer exists, not finding it.',
    facts: [
      'Evaluate each statement in complete isolation first. Forgetting statement 1 while reading 2 is the discipline.',
      'For "what is the value", hunt for a second possible value before choosing C.',
      'For yes/no, try to produce both a yes and a no. One counterexample settles it.',
      'Sufficiency means pinned down, not friendly. Ugly irrational answers still count.',
      'Even powers destroy sign information; odd powers preserve it.',
      'Parity propagates: n and nᵏ always share parity.',
      'Two genuinely independent linear equations in two unknowns are sufficient.',
    ],
    example: 'n prime between 10 and 20, and n leaves remainder 1 mod 6. Both 13 and 19 survive, so even together the statements fail.',
    traps: 'Choosing C when each statement actually worked alone, or when even both together leave two candidates.',
  },
  'Critical reasoning': {
    core: 'Find the conclusion, then find the gap between the evidence and that conclusion. Every answer choice lives or dies on that gap.',
    facts: [
      'Weaken a causal claim: supply a rival cause, reverse the causation, or show coincidence.',
      'Assumption questions: negate the choice. If the conclusion collapses, it was necessary.',
      'Watch for scope shifts — evidence about one cost, conclusion about total cost.',
      'The strongest strengthener for observational data is a controlled experiment.',
      '"All A are B" makes B necessary for A, not sufficient. The reversal is the most tested error.',
      '"Must be true" answers are modest restatements. Anything adding causation or prediction is wrong.',
      'To weaken a generalization from one case, attack how representative the case is.',
      'When a rate falls while a count rises, suspect a change in who enters the denominator.',
    ],
    example: 'Cameras installed, accidents fell 30%, so cameras worked. A citywide speed-limit cut in the same year supplies a rival cause and guts the argument.',
    traps: 'Cost and feasibility objections almost never weaken a causal argument.',
  },
  'Text completion': {
    core: 'Predict your own word before reading a single choice. Then find the choice closest to your prediction.',
    facts: [
      'Contrast markers — although, despite, yet, rather than, far from — mean the blank reverses the stated idea.',
      'A colon or semicolon means the two halves agree; the second half defines the first.',
      '"So … that" defines the blank by its consequence. Read the result clause first.',
      '"Less a rupture than a ___" and "not merely X but Y" are built-in antonym and escalation clues.',
      'On multi-blank items, solve the blank with the most textual support first, then use it to constrain the rest.',
      'Multi-blank questions are all-or-nothing. Verify every blank before submitting.',
    ],
    example: '"Far from being (i)___, the prose is so densely allusive that readers need annotated editions to (ii)___ it." Difficulty is the theme, so: accessible, apprehend.',
    traps: 'Choices that describe the eventual outcome, when the blank describes the earlier state.',
  },
  'Sentence equivalence': {
    core: 'You need a matching pair, not two words that merely fit. Scan for synonym pairs first, then test the pair against the sentence.',
    facts: [
      'If a word fits but has no partner among the choices, it is wrong.',
      'The pair requirement eliminates more choices than meaning alone.',
      'Match intensity, not just direction. "Not overturned outright, but ___" wants a milder word.',
      'Watch words with two senses — "minute" as tiny, not as a unit of time.',
      'A colon after the blank supplies its definition. Convert that clause to one adjective.',
    ],
    example: '"Remained remarkably ___, betraying no sign of anxiety." Composed and unruffled pair; contrite and indignant are lone words.',
    traps: 'Two words that both fit but are not synonyms of each other.',
  },
  'Reading comprehension': {
    core: 'Read for structure, not detail. Find the author\'s claim and the pivot where they turn against something.',
    facts: [
      'Purpose answers must cover the whole passage. Choices naming one real detail are scope traps.',
      '"In order to" asks for function. Reread the sentence before and after the cited detail.',
      'Inference answers must be forced by the text. Prefer the hedged choice over the dramatic one.',
      'Words like "but", "however", and "in fact" mark where the argument turns. Those sentences carry the thesis.',
      'A trailing clause about later events usually generalizes the argument.',
      'Rule out any choice the passage explicitly disclaims.',
    ],
    example: 'A passage ending "not merely X" invites a question asking which option is X — the answer restates the insufficient approach.',
    traps: 'Choosing a statement that is true in the world but not supported by this passage.',
  },
  'Data insights': {
    core: 'Check each part of a multi-part question separately. The count and the rate frequently point to different rows.',
    facts: [
      'Confirm the count first, then compute the rate only for the row you identified.',
      'An unweighted mean averages the row values and ignores group size.',
      'Compound growth never splits evenly across periods: doubling over two years is about 41% annually, not 50%.',
      'Total cost = rate × volume. The lowest unit cost often belongs to the highest total spender.',
    ],
    example: 'Industrial admits the fewest students but shares the highest admit rate with Civil. Both facts must be checked independently.',
    traps: 'Averaging four rates instead of dividing the combined totals.',
  },
};


/* ============================================================
   DEEP — the layer under the rules. Why each shortcut is true,
   and the machinery that generalizes it. This is what separates
   reliably solving 165-level questions from 170-level ones.
   ============================================================ */

const DEEP = {
  'Number properties': [
    { q:'Why is every prime above 3 of the form 6k ± 1?',
      a:'Any integer is 6k, 6k+1, 6k+2, 6k+3, 6k+4, or 6k+5. The forms 6k, 6k+2, 6k+4 are even, and 6k+3 is divisible by 3. That leaves only 6k+1 and 6k+5 (which is 6k−1) available for primes above 3. From this, p² = 36k² ± 12k + 1 ≡ 1 (mod 12) instantly.' },
    { q:'Why do remainder cycles close so fast?',
      a:'Working mod n, only n distinct remainders exist, so any sequence of powers must repeat within n steps — usually far sooner. Formally, if a and n share no factors, a^φ(n) ≡ 1 (mod n). You never need Euler\'s theorem on the exam, but knowing the cycle is guaranteed tells you to stop computing after four or five terms.' },
    { q:'GCD and LCM together',
      a:'For any two positive integers, GCD(a,b) × LCM(a,b) = a × b. So if you know one, you get the other for free. Structurally: GCD takes the lowest power of each shared prime, LCM takes the highest power of every prime appearing in either.' },
    { q:'Counting divisors of a perfect square',
      a:'A perfect square always has an odd number of divisors, because divisors pair up (d with n/d) except when d = √n pairs with itself. This is the one case where the pairing argument breaks, and it is a favourite setup for "how many integers under 100 have an odd number of factors."' },
  ],
  'Algebra': [
    { q:'The symmetric-function toolkit',
      a:'Any expression symmetric in x and y can be written using only s = x+y and p = xy. Key conversions: x² + y² = s² − 2p; x³ + y³ = s³ − 3ps; 1/x + 1/y = s/p; x² y + x y² = ps. Once you extract s and p, you never need the individual roots.' },
    { q:'Vieta without the quadratic formula',
      a:'For ax² + bx + c = 0, the roots sum to −b/a and multiply to c/a. So a question asking for the sum or product of solutions never requires solving. This is why |2x − 5| = 9 has roots summing to 5: they sit symmetrically about x = 2.5.' },
    { q:'Why inequalities flip',
      a:'Multiplying by a negative reflects the number line about zero, reversing every order relation. The practical consequence on the exam: you cannot multiply an inequality by a variable unless you know its sign, which is exactly why so many data sufficiency questions hinge on whether x > 0.' },
  ],
  'Percents': [
    { q:'Why successive changes multiply',
      a:'A percent change is a multiplication by (1 + r), and multiplication composes. Up x then down x gives (1+x)(1−x) = 1 − x², so you always lose x² of the original. At 20% that is 0.04, or 4%.' },
    { q:'The reversal pairs',
      a:'A gain of 1/n is exactly undone by a loss of 1/(n+1). Up 1/4 (25%) is undone by down 1/5 (20%); up 1/3 by down 1/4; up 1/2 by down 1/3. Recognizing these in fraction form makes "net change" questions instant.' },
    { q:'Margin on cost versus margin on price',
      a:'Markup on cost: S = C(1 + m). Margin on selling price: S = C/(1 − m). These give different answers for the same m, and the exam tests the distinction deliberately. A 20% margin on price means cost is 80% of price, so S = C/0.8.' },
  ],
  'Statistics': [
    { q:'Why mean equals median in evenly spaced sets',
      a:'Pair the first with the last, second with second-to-last, and so on. Every pair has the same sum, so their common average is the overall mean — and that value sits at the centre, which is the median. This holds for any arithmetic sequence regardless of length.' },
    { q:'Standard deviation under transformation',
      a:'Adding c to every value shifts the mean by c and leaves every deviation unchanged, so SD is unchanged. Multiplying by k scales every deviation by |k|, so SD scales by |k|. Variance, being squared, scales by k². The exam tests the shift case constantly.' },
    { q:'Mean versus median as a signal',
      a:'When the mean exceeds the median, the data is right-skewed — a few large values pull the average up. When the median exceeds the mean, it is left-skewed. On QC questions giving both, this tells you which direction the outliers must lie, and often generates the counterexample you need.' },
  ],
  'Probability': [
    { q:'When does order matter?',
      a:'If you compute probability using ordered outcomes in the numerator, the denominator must also be ordered, and vice versa. Both give the same answer if applied consistently. Errors come from mixing — counting unordered successes over ordered total.' },
    { q:'Conditional probability',
      a:'P(A and B) = P(A) × P(B given A). "Without replacement" is just the case where P(B given A) differs from P(B). Independence is the special case where conditioning changes nothing.' },
    { q:'The complement as a strategy',
      a:'Whenever a question says "at least", the complement has fewer cases. At least one of n events: 1 − P(none). At least two: 1 − P(none) − P(exactly one). Counting up from zero is almost always shorter than counting down from the target.' },
  ],
  'Combinatorics': [
    { q:'Why C(n,k) = n!/(k!(n−k)!)',
      a:'There are n!/(n−k)! ordered ways to pick k items. Each unordered selection was counted k! times, once per arrangement, so divide. This is exactly why 8 people choosing 3 gives 336 ordered and 56 unordered.' },
    { q:'The complement in counting',
      a:'"At least 2 women" from a mixed group: total minus zero-women minus one-woman. The forbidden cases are almost always fewer than the allowed ones, and each is a clean single product.' },
    { q:'Arrangements with restrictions',
      a:'Treat a "must be together" block as one unit, arrange the units, then multiply by the internal arrangements of the block. For "must be apart", count the total and subtract the together case.' },
    { q:'Identical items',
      a:'Divide by the factorial of each repeat group. LEVEL has 5!/(2!·2!) = 30. The rule generalizes: distributing n identical items into k distinct boxes is C(n+k−1, k−1), though the exam rarely pushes this far.' },
  ],
  'Geometry': [
    { q:'Where the special triangles come from',
      a:'Cut an equilateral triangle of side 2 in half: you get 30-60-90 with sides 1, √3, 2. Cut a unit square along its diagonal: you get 45-45-90 with sides 1, 1, √2. Deriving them takes five seconds and removes any doubt about which side is which.' },
    { q:'Inscribed angle theorem',
      a:'An angle inscribed in a circle is half the central angle subtending the same arc. The most-tested consequence: any angle inscribed in a semicircle is exactly 90°. If a triangle has the diameter as one side, it is right-angled.' },
    { q:'Why the chord equal to the radius gives 60°',
      a:'Two radii and the chord form a triangle with all three sides equal, so it is equilateral and every angle is 60°. This makes the sector exactly one sixth of the circle.' },
    { q:'Similar figures scale predictably',
      a:'If lengths scale by k, areas scale by k² and volumes by k³. A question saying a solid\'s dimensions doubled is telling you the volume went up eightfold.' },
  ],
  'Coordinate geometry': [
    { q:'Distance and midpoint from one idea',
      a:'Both come from treating the segment as the hypotenuse of a right triangle with legs Δx and Δy. Distance = √(Δx² + Δy²); midpoint is the coordinate-wise average. Sketching the right triangle makes both self-evident.' },
    { q:'Why perpendicular slopes multiply to −1',
      a:'Rotating a direction vector (a, b) by 90° gives (−b, a). The slope changes from b/a to −a/b, and their product is −1. Horizontal and vertical lines are the exception, since one slope is undefined.' },
    { q:'Reading a circle equation',
      a:'(x − h)² + (y − k)² = r² is a circle centred at (h, k) with radius r. Integer points on it come from Pythagorean triples, which is why x² + y² = 25 has exactly 12 lattice points.' },
  ],
  'Exponents': [
    { q:'Choosing a common base versus a common exponent',
      a:'If the bases share a prime, convert bases: 9ˣ = 3²ˣ. If the exponents share a factor, convert exponents: 2³⁰ = 8¹⁰ and 3²⁰ = 9¹⁰. Take the GCF of the exponents as your target when the bases refuse to match.' },
    { q:'Fractional and negative exponents',
      a:'a^(1/n) is the nth root; a^(−n) = 1/aⁿ. Combining: a^(−2/3) = 1/∛(a²). Every root question can be rewritten as an exponent question, which makes the algebra rules apply directly.' },
    { q:'Why doubling time is exponential',
      a:'Each period multiplies by 2, so n periods multiply by 2ⁿ. Three doubling periods is ×8. The linear instinct — three doublings means ×6 — is planted as an answer choice every time.' },
  ],
  'Sequences': [
    { q:'Why the sum formula works',
      a:'Write the sequence forward and backward and add them term by term. Every column sums to (first + last), and there are n columns, giving 2S = n(first + last). Hence S = n(first + last)/2. This is Gauss\'s trick and it works for any arithmetic sequence.' },
    { q:'Geometric sequences',
      a:'aₙ = a₁rⁿ⁻¹, and the sum of n terms is a₁(rⁿ − 1)/(r − 1). For |r| < 1 the infinite sum converges to a₁/(1 − r). The GRE occasionally uses the infinite case for repeating decimals.' },
  ],
  'Sets': [
    { q:'Three-set inclusion-exclusion',
      a:'|A∪B∪C| = |A| + |B| + |C| − |A∩B| − |A∩C| − |B∩C| + |A∩B∩C|. The triple overlap is added back because it was subtracted three times after being added three times. Drawing the Venn diagram and filling from the centre outward is more reliable under time pressure.' },
    { q:'Why "or" uses the LCM',
      a:'A number divisible by both 3 and 5 is divisible by 15, so the double-counted set is the multiples of LCM(3,5). Using the product instead of the LCM only works when the numbers are coprime, which is why 4 and 6 give 12, not 24.' },
  ],
  'Mixtures': [
    { q:'Alligation as a shortcut',
      a:'Mixing solutions of concentration a and b to reach c means the ratio of volumes is (b − c) : (c − a). Mixing 40% and 10% to get 20% needs a 10:20 = 1:2 ratio of the strong to the weak. This replaces the full equation setup.' },
    { q:'Why drain-and-replace is proportional',
      a:'Draining removes solute in the same proportion it exists in the mixture, so removing fraction f leaves (1 − f) of the solute while the volume is restored. Repeating the operation n times leaves (1 − f)ⁿ of the original solute.' },
  ],
  'Rates': [
    { q:'Why rates add but times do not',
      a:'Rate is work per unit time, an extensive quantity — two workers genuinely produce the sum of their outputs each hour. Time is not additive because it is the reciprocal. This is also why average speed uses total distance over total time rather than averaging speeds.' },
    { q:'The harmonic mean',
      a:'For equal distances at speeds a and b, the average speed is 2ab/(a+b), the harmonic mean. For 30 and 60 that gives 2(1800)/90 = 40, matching the long computation. It is always below the arithmetic mean, which is why the "average of the speeds" answer is always too high.' },
  ],
  'Functions': [
    { q:'Composition order',
      a:'f(g(x)) applies g first. The notation reads right to left, which is the opposite of how it is spoken, and that mismatch is where errors come from. Write the inner value explicitly before substituting.' },
    { q:'Self-inverse functions',
      a:'f(x) = x/(x−1) satisfies f(f(x)) = x. So does f(x) = 1/x, f(x) = c − x, and f(x) = c/x. If a question asks for f applied twice, check whether the function is an involution before grinding through it.' },
  ],
  'Ratios': [
    { q:'Ratios as scaling factors',
      a:'a:b = 3:4 means a = 3k and b = 4k for some k. Writing it this way turns every ratio problem into ordinary algebra and makes chained ratios trivial: match the k values across the shared term.' },
    { q:'Why part-to-part differs from part-to-whole',
      a:'5:4 boys to girls means 5/9 of the class is boys, not 5/4. Misreading which comparison is intended is the most common ratio error, and the exam supplies both as answer choices.' },
  ],
  'Arithmetic': [
    { q:'Estimation as a first move',
      a:'Before computing, bound the answer. If a fraction is just under 1/2 and the choices are 20%, 33%, 49%, and 67%, you are done without dividing. On data interpretation this converts most questions into a comparison rather than a calculation.' },
    { q:'Why inclusive counts add one',
      a:'The count of integers from a to b is the number of gaps (b − a) plus the starting element itself. Every fencepost problem has this structure: n posts create n − 1 gaps.' },
  ],
  'Data interpretation': [
    { q:'Weighted versus unweighted averages',
      a:'The unweighted mean averages the row values; the weighted mean divides the combined totals. They coincide only when all groups are the same size. If your answer matches the simple average exactly, check whether you forgot the weights.' },
    { q:'Percent of a percent',
      a:'A share that falls from 20% to 11% has dropped 9 percentage points but 45% in relative terms. Questions phrase these interchangeably in casual English and precisely in the answer choices, so read which one is wanted.' },
  ],
  'Data sufficiency': [
    { q:'The discipline of isolation',
      a:'Read statement 2 as if you had never seen statement 1. The most common wrong answer on hard DS questions comes from carrying information across. A physical habit helps: cover statement 1 with your hand or scratch paper.' },
    { q:'Choosing test cases deliberately',
      a:'Do not test random numbers. Test the boundary classes: negatives, zero, one, fractions between 0 and 1, and large values. A statement that survives all six is almost certainly sufficient; one that fails is disproven by a single case.' },
    { q:'Why C is over-chosen',
      a:'Combining feels safe, so C attracts guesses. Before choosing it, confirm each statement genuinely fails alone, and confirm the combination genuinely pins a unique value. Questions are built so that exactly one of those checks fails for the unwary.' },
  ],
  'Critical reasoning': [
    { q:'Necessary versus sufficient assumptions',
      a:'A necessary assumption must be true for the argument to work — test it by negating it and seeing whether the conclusion collapses. A sufficient assumption would guarantee the conclusion. The GMAT asks for necessary assumptions far more often, and the negation test is definitive.' },
    { q:'The three causal attacks',
      a:'Any argument from correlation to causation is vulnerable in exactly three ways: an alternative cause, reversed causation, or coincidence. Weakening choices will be one of these three. Cost, feasibility, and public opinion are not among them.' },
    { q:'Selection effects',
      a:'When a sample selects itself — magazine readers, volunteers, survivors — it cannot support a claim about the general population. Related: when a screening programme changes who enters a dataset, rates computed on that dataset shift without any real-world change.' },
  ],
  'Text completion': [
    { q:'Predicting before reading choices',
      a:'The choices are engineered to look plausible. Committing to your own word first means you are matching against your prediction rather than being pulled between five near-misses. On three-blank questions this is the difference between reliable and coin-flip.' },
    { q:'Structural signal words',
      a:'Same direction: moreover, indeed, in fact, thus, because. Reverse direction: although, despite, yet, however, far from, rather than, paradoxically. Every text completion turns on one of these, and finding it first tells you the polarity before you read a single choice.' },
  ],
  'Sentence equivalence': [
    { q:'Why the pair requirement helps you',
      a:'It converts a vocabulary test into a matching puzzle. Even with imperfect vocabulary, spotting the only two words that mean the same thing often identifies the answer. Work from the pairs backward to the sentence when a word is unfamiliar.' },
    { q:'Traps built from single fitting words',
      a:'Test writers include one or two words that fit the sentence perfectly but have no synonym present. These are not wrong in meaning — they are wrong in structure. If you cannot find a partner, move on regardless of how well it reads.' },
  ],
  'Reading comprehension': [
    { q:'Reading for architecture',
      a:'On a first pass, note only: what does the author claim, where do they turn against something, and what is each paragraph doing. Details can be relocated in seconds; the argument\'s shape cannot be reconstructed without rereading.' },
    { q:'Why hedged answers usually win',
      a:'Inference answers must be forced by the text. Strong words — always, proves, entirely, never — require strong support that short passages rarely provide. Words like suggests, may, incomplete, and tends to are far easier for a passage to license.' },
  ],
  'Data insights': [
    { q:'Multi-part questions are scored all-or-nothing',
      a:'A two-part answer earns nothing if either half is wrong, so verify each independently rather than assuming the same row answers both. Count and rate very often point to different entries.' },
    { q:'Compound growth over a span',
      a:'If a value multiplies by M over n periods, the per-period rate is M^(1/n) − 1. Doubling over two years is √2 − 1 ≈ 41%, not 50%. The naive division of total growth by the number of periods always overstates.' },
  ],
};


/* ============================================================
   FLASHCARDS
   Three decks. Vocabulary is deliberately the largest: GRE
   verbal is substantially a vocabulary test, and text
   completion plus sentence equivalence are unwinnable without
   it. Cards run on the same Leitner scheduler as questions.
   ============================================================ */

const DECKS = {
  vocab:  { name:'GRE vocabulary', sub:'High-frequency words that decide text completion and sentence equivalence', exam:'GRE' },
  math:   { name:'Math facts',     sub:'Formulas and rules you must recall instantly, not derive', exam:'both' },
  method: { name:'Verbal method',  sub:'Structural signals and question-type tactics', exam:'GRE' },
};

/* w = word/front · d = definition/back · s = sentence or note */
const VOCAB = [
  ['abate','to lessen in intensity','The storm abated by morning, though the flooding remained.'],
  ['aberrant','deviating from the norm','A single aberrant reading does not overturn a decade of data.'],
  ['abscond','to leave secretly, often to avoid consequences','The treasurer absconded with the fund before the audit.'],
  ['abstruse','difficult to understand','His proofs were rigorous but so abstruse that few could follow them.'],
  ['accretion','gradual growth by accumulation','The reef formed by slow accretion over thousands of years.'],
  ['acumen','keen practical judgment','Her business acumen turned a failing shop profitable in a year.'],
  ['admonish','to warn or reprimand gently','The editor admonished him for missing yet another deadline.'],
  ['adulterate','to make impure by adding something inferior','The oil had been adulterated with cheaper substitutes.'],
  ['aesthetic','concerning beauty or taste','Her objection was aesthetic rather than practical.'],
  ['alacrity','cheerful readiness','He accepted the assignment with surprising alacrity.'],
  ['amalgamate','to combine into a unified whole','The two firms amalgamated after a decade of rivalry.'],
  ['ambivalent','having mixed or contradictory feelings','She was ambivalent about the promotion, wanting the title but not the hours.'],
  ['ameliorate','to make better','The reforms did little to ameliorate conditions in the camps.'],
  ['anachronism','something out of its proper time','The clock in the Roman scene is a famous anachronism.'],
  ['analogous','comparable in certain respects','The circuit is analogous to a system of pipes and valves.'],
  ['anomalous','inconsistent with what is expected','The anomalous result was traced to a faulty sensor.'],
  ['antipathy','deep-seated dislike','His antipathy toward committee work was well known.'],
  ['apathy','lack of interest or concern','Voter apathy, not opposition, defeated the measure.'],
  ['appease','to pacify by giving in to demands','Concessions meant to appease the union only emboldened it.'],
  ['apprehension','anxiety, or the act of grasping mentally','She approached the interview with visible apprehension.'],
  ['approbation','approval or praise','The design won the approbation of every juror.'],
  ['arduous','demanding great effort','The ascent was arduous but the route was never technical.'],
  ['articulate','to express clearly (verb); well-spoken (adj)','He struggled to articulate why the argument failed.'],
  ['artless','without guile; naturally simple','Her artless honesty disarmed the panel.'],
  ['ascetic','practicing severe self-discipline','He lived an ascetic life, owning almost nothing.'],
  ['assuage','to soothe or relieve','Nothing the airline offered assuaged the passengers.'],
  ['audacious','bold to the point of recklessness','The audacious plan required crossing the range in winter.'],
  ['austere','severe in manner or plain in appearance','The austere hall held nothing but benches.'],
  ['banal','lacking originality; obvious','The speech was banal, a chain of borrowed phrases.'],
  ['belie','to give a false impression of; to contradict','His calm belied real alarm.'],
  ['beneficent','doing good','The foundation was beneficent but poorly organized.'],
  ['bolster','to support or strengthen','New evidence bolstered the earlier finding.'],
  ['bombastic','pompous in speech','The bombastic introduction lasted longer than the lecture.'],
  ['burgeon','to grow rapidly','The field burgeoned once sequencing costs collapsed.'],
  ['cacophony','harsh discordant sound','The tuning orchestra produced a brief cacophony.'],
  ['candor','frankness','Her candor about the failure was unusual for an executive.'],
  ['capricious','given to sudden unpredictable change','The funding process was capricious, rewarding no consistent quality.'],
  ['castigate','to criticize severely','The report castigated the agency for years of neglect.'],
  ['catalyst','something that precipitates change','The strike was the catalyst, not the cause.'],
  ['caustic','bitingly sarcastic; corrosive','His caustic review ended the play\'s run.'],
  ['chicanery','deception by trickery','The contract was won through outright chicanery.'],
  ['circumspect','cautious; considering all consequences','She was circumspect in her public statements.'],
  ['coalesce','to come together into one mass','The scattered protests coalesced into a movement.'],
  ['cogent','clear, logical, and convincing','He gave a cogent case for delaying the launch.'],
  ['commensurate','proportional','The penalty was hardly commensurate with the offense.'],
  ['complaisant','eager to please; obliging','The complaisant staff never questioned a directive.'],
  ['conciliatory','intended to placate','His conciliatory tone defused the meeting.'],
  ['condone','to overlook or forgive','The board could not condone the omission, however small.'],
  ['confound','to confuse; to prove wrong','The results confounded every prior model.'],
  ['connoisseur','an expert judge of taste','A connoisseur of early printing, she spotted the forgery at once.'],
  ['contentious','causing or likely to cause argument','Redistricting is the most contentious item on the agenda.'],
  ['contrite','feeling remorse','He was contrite, but the apology came far too late.'],
  ['conundrum','a difficult problem','The scheduling conundrum had no clean solution.'],
  ['corroborate','to confirm with evidence','A second sample corroborated the initial finding.'],
  ['craven','cowardly','The craven retreat cost them the position.'],
  ['credulous','too ready to believe','A credulous audience will accept almost any claim.'],
  ['cryptic','mysterious in meaning','His cryptic note explained nothing.'],
  ['culpable','deserving blame','The inspector was found culpable for the oversight.'],
  ['cursory','hasty and superficial','A cursory glance missed the discrepancy entirely.'],
  ['debunk','to expose as false','The paper debunked a claim repeated for decades.'],
  ['decorum','proper behavior','Courtroom decorum forbids such outbursts.'],
  ['deference','respectful submission to another\'s judgment','Out of deference to the chair, she withheld her objection.'],
  ['deleterious','harmful','The additive proved deleterious in long-term studies.'],
  ['denigrate','to belittle','He denigrated rivals rather than defending his own record.'],
  ['derivative','unoriginal; copied from a source','Critics found the score derivative of earlier work.'],
  ['desiccate','to dry out thoroughly','The specimens were desiccated for storage.'],
  ['diatribe','a bitter verbal attack','The letter was less a review than a diatribe.'],
  ['didactic','intended to instruct, often heavy-handedly','The novel is too didactic to work as a story.'],
  ['diffident','lacking self-confidence','A diffident speaker, she wrote far better than she presented.'],
  ['digress','to depart from the main subject','He digressed for ten minutes before returning to the point.'],
  ['dilatory','causing or tending toward delay','The dilatory filings were plainly a stalling tactic.'],
  ['disabuse','to free from a misconception','Let me disabuse you of the notion that this is simple.'],
  ['discerning','showing good judgment','A discerning editor would have cut the third chapter.'],
  ['disparate','fundamentally different','The study merged disparate datasets with incompatible units.'],
  ['disparage','to belittle','It is easier to disparage a theory than to test it.'],
  ['disseminate','to spread widely','The findings were disseminated before peer review.'],
  ['dogmatic','asserting opinions as though beyond dispute','His dogmatic style discouraged any questioning.'],
  ['dubious','doubtful; questionable','The provenance of the manuscript is dubious.'],
  ['ebullient','enthusiastic and lively','Her ebullient manner carried the whole department.'],
  ['eclectic','drawing from many sources','An eclectic syllabus mixing physics and poetry.'],
  ['efficacy','the power to produce a desired effect','The trial measured efficacy, not safety.'],
  ['effrontery','shameless boldness','He had the effrontery to bill them for the mistake.'],
  ['elicit','to draw out a response','The question elicited nothing but silence.'],
  ['eloquent','fluent and persuasive','An eloquent defense of an indefensible position.'],
  ['empirical','based on observation rather than theory','The claim is plausible but lacks empirical support.'],
  ['enervate','to weaken or drain of energy','The heat enervated the entire crew.'],
  ['engender','to give rise to','The policy engendered more resentment than compliance.'],
  ['enigmatic','mysterious; hard to interpret','Her enigmatic reply satisfied no one.'],
  ['ephemeral','lasting a very short time','The startup\'s advantage proved ephemeral.'],
  ['equivocal','open to more than one interpretation','The data were equivocal, supporting neither side.'],
  ['erudite','having deep learning','An erudite footnote longer than the paragraph above it.'],
  ['eschew','to deliberately avoid','She eschews jargon even when writing for specialists.'],
  ['esoteric','understood by only a few','An esoteric debate confined to three journals.'],
  ['exacerbate','to make worse','The tariffs exacerbated a shortage already underway.'],
  ['exculpate','to clear of blame','The recording exculpated the dispatcher entirely.'],
  ['exhaustive','complete; thorough','An exhaustive survey of every parish record.'],
  ['exigent','urgent; demanding','Exigent circumstances justified the delay in notice.'],
  ['extol','to praise highly','Reviewers extolled a book almost no one finished.'],
  ['facetious','treating serious matters with inappropriate humor','His facetious answer derailed the discussion.'],
  ['fallacious','based on a mistaken belief','The inference is fallacious, though the premises are true.'],
  ['fastidious','very attentive to detail; hard to please','A fastidious editor who queried every comma.'],
  ['fatuous','silly and pointless','The proposal rested on a fatuous assumption about demand.'],
  ['fervor','intense passion','He argued with a fervor the topic scarcely warranted.'],
  ['flout','to openly disregard a rule','The firm flouted the regulation for years.'],
  ['forestall','to prevent by acting first','The memo was written to forestall criticism.'],
  ['fortuitous','happening by chance','The discovery was entirely fortuitous.'],
  ['garrulous','excessively talkative','A garrulous neighbor who narrated every errand.'],
  ['germane','relevant','That objection, however interesting, is not germane.'],
  ['gregarious','sociable','A gregarious species that never forages alone.'],
  ['hackneyed','overused; unoriginal','The metaphor was hackneyed by 1890.'],
  ['harangue','a lengthy aggressive speech','The meeting ended in a harangue about parking.'],
  ['heterodox','not conforming to accepted standards','His heterodox methods eventually became standard.'],
  ['iconoclast','one who attacks established beliefs','An iconoclast who questioned the field\'s founding assumption.'],
  ['idiosyncratic','peculiar to an individual','Her idiosyncratic notation confused every collaborator.'],
  ['impecunious','having little money','An impecunious scholar living on grants.'],
  ['imperturbable','unable to be upset','Imperturbable under questioning, he never raised his voice.'],
  ['impetuous','acting rashly','An impetuous decision made in a single afternoon.'],
  ['implacable','unable to be appeased','An implacable critic of the entire programme.'],
  ['inchoate','just begun; not fully formed','The theory was inchoate, more intuition than argument.'],
  ['incongruous','out of place','The glass tower was incongruous among the terraces.'],
  ['indolent','habitually lazy','An indolent term spent almost entirely in the café.'],
  ['ineffable','too great to be expressed in words','He described the view as ineffable, then described it anyway.'],
  ['inexorable','impossible to stop','The inexorable decline of the print edition.'],
  ['ingenuous','innocent and unsuspecting','An ingenuous question that exposed the whole problem.'],
  ['inimical','harmful; hostile','Conditions inimical to any microbial life.'],
  ['innocuous','harmless','An innocuous remark that somehow started the feud.'],
  ['insipid','lacking flavor or interest','An insipid sequel that repeated every earlier beat.'],
  ['intractable','hard to control or solve','An intractable problem resisting every known method.'],
  ['intransigent','refusing to compromise','Both sides remained intransigent through the third round.'],
  ['inundate','to flood or overwhelm','The office was inundated with applications.'],
  ['inveterate','habitual; long established','An inveterate note-taker who annotated everything.'],
  ['irascible','easily angered','An irascible supervisor feared by every intern.'],
  ['laconic','using very few words','His laconic reply was a single syllable.'],
  ['languid','lacking energy','A languid afternoon with nothing accomplished.'],
  ['latent','existing but not yet visible','A latent defect that surfaced only under load.'],
  ['laud','to praise','Critics lauded the restraint of the later work.'],
  ['lucid','clear and easy to understand','A lucid explanation of a genuinely hard idea.'],
  ['magnanimous','generous, especially toward a rival','A magnanimous concession speech.'],
  ['malleable','easily influenced or shaped','Public opinion proved more malleable than expected.'],
  ['maverick','an independent-minded person','A maverick who ignored the department\'s methods.'],
  ['mitigate','to make less severe','Nothing could mitigate the damage to the reputation.'],
  ['mollify','to appease','The statement was written to mollify shareholders.'],
  ['morose','sullen and gloomy','He grew morose as the results came in.'],
  ['munificent','extremely generous','A munificent bequest founded the whole library.'],
  ['nascent','just coming into existence','The nascent industry had no standards at all.'],
  ['nebulous','vague; ill-defined','A nebulous plan with no dates attached.'],
  ['obdurate','stubbornly refusing to change','The committee was obdurate despite the evidence.'],
  ['obfuscate','to deliberately make unclear','The filing obfuscated more than it disclosed.'],
  ['obsequious','excessively eager to please','His obsequious manner irritated everyone above him.'],
  ['obviate','to remove a need or difficulty','The new proof obviates the earlier assumption.'],
  ['occlude','to block','Sediment occluded the channel within a decade.'],
  ['onerous','involving heavy burden','Onerous reporting requirements deterred small applicants.'],
  ['opaque','hard to understand; not transparent','The methodology section is deliberately opaque.'],
  ['ostensible','apparent but not necessarily real','The ostensible reason was cost; the real one was politics.'],
  ['palliate','to relieve without curing','The measures palliate the symptom and ignore the cause.'],
  ['panacea','a cure-all','No single reform is a panacea for the housing shortage.'],
  ['paragon','a model of excellence','A paragon of careful experimental design.'],
  ['partisan','strongly biased toward a side','A partisan account presented as neutral history.'],
  ['paucity','scarcity','A paucity of evidence, not a paucity of theories.'],
  ['pedantic','overly concerned with minor detail','A pedantic objection about terminology.'],
  ['penchant','a strong liking','A penchant for overcomplicating simple systems.'],
  ['perfunctory','done without care or interest','A perfunctory review that missed the central error.'],
  ['pernicious','harmful in a gradual, subtle way','A pernicious assumption buried in the model.'],
  ['perspicacious','having keen insight','A perspicacious reader who caught the inconsistency.'],
  ['phlegmatic','unemotional and calm','Phlegmatic even as the deadline collapsed.'],
  ['pithy','brief and full of meaning','A pithy summary of a four-hundred-page report.'],
  ['placate','to soothe anger','Nothing said that evening placated the residents.'],
  ['platitude','a trite, meaningless statement','The address offered platitudes in place of policy.'],
  ['plausible','seeming reasonable','A plausible mechanism that turned out to be wrong.'],
  ['polemic','a strong verbal or written attack','The essay is a polemic, not an analysis.'],
  ['pragmatic','practical rather than theoretical','A pragmatic compromise that satisfied nobody fully.'],
  ['precipitate','to cause to happen suddenly (v); hasty (adj)','The ruling precipitated a wave of filings.'],
  ['preclude','to prevent from happening','The wording precludes any later appeal.'],
  ['prescient','having foreknowledge','A prescient warning issued two years early.'],
  ['prevaricate','to speak evasively','He prevaricated rather than admit the error.'],
  ['probity','complete honesty','Her probity was never questioned, even by opponents.'],
  ['prodigal','wastefully extravagant','A prodigal budget with nothing to show for it.'],
  ['prolific','producing much','A prolific author of forty books in thirty years.'],
  ['propensity','a natural inclination','A propensity to over-explain simple findings.'],
  ['prosaic','dull; commonplace','The explanation was prosaic: someone forgot to check.'],
  ['pungent','sharp in taste or smell; biting','A pungent critique delivered in two sentences.'],
  ['quiescent','inactive; dormant','The volcano remained quiescent for a century.'],
  ['quixotic','idealistic and impractical','A quixotic scheme to rebuild the line by hand.'],
  ['rarefied','belonging to a select group; thin (of air)','The rarefied world of sovereign debt arbitrage.'],
  ['recalcitrant','stubbornly resistant to authority','A recalcitrant supplier who ignored every notice.'],
  ['recondite','obscure; known to few','A recondite corner of nineteenth-century metallurgy.'],
  ['redundant','unnecessarily repetitive','Three redundant paragraphs restating the abstract.'],
  ['refute','to prove wrong','A single counterexample refutes the general claim.'],
  ['relegate','to consign to a lower position','The finding was relegated to a footnote.'],
  ['reticent','reserved; unwilling to speak','Reticent about his own role in the project.'],
  ['sagacious','wise and discerning','A sagacious choice that looked reckless at the time.'],
  ['salient','most noticeable or important','The salient objection is one of cost.'],
  ['sanction','to approve (v); a penalty (n)','Note the two opposite meanings — the exam exploits this.'],
  ['sanguine','optimistic','Sanguine about the timeline despite every delay.'],
  ['scrupulous','very careful and thorough; principled','Scrupulous attribution of every borrowed idea.'],
  ['soporific','causing sleepiness','A soporific lecture on filing procedure.'],
  ['specious','superficially plausible but wrong','A specious argument that survives only if unexamined.'],
  ['spurious','false; not genuine','A spurious correlation driven entirely by season.'],
  ['staid','sedate and conventional','A staid institution unmoved by three decades of change.'],
  ['stolid','showing little emotion','Stolid in the face of open hostility.'],
  ['substantiate','to support with evidence','No document substantiates the claim.'],
  ['supercilious','behaving as though superior','A supercilious reply to a reasonable question.'],
  ['superfluous','more than needed','Every superfluous clause was struck.'],
  ['tacit','understood without being stated','A tacit agreement never written down.'],
  ['tenuous','weak; insubstantial','The link is tenuous at best.'],
  ['torpor','sluggish inactivity','Institutional torpor defeated the proposal.'],
  ['tortuous','full of twists; complex','A tortuous argument requiring six premises.'],
  ['tractable','easy to manage or solve','The problem becomes tractable under one assumption.'],
  ['trenchant','vigorous and incisive','A trenchant critique of the whole methodology.'],
  ['truculent','aggressively defiant','A truculent witness who contested every question.'],
  ['ubiquitous','present everywhere','Sensors are now ubiquitous in freight logistics.'],
  ['unequivocal','leaving no doubt','An unequivocal rejection with no room to negotiate.'],
  ['untenable','not defensible','The position became untenable once the data appeared.'],
  ['vacillate','to waver between options','The board vacillated for months.'],
  ['venerate','to regard with deep respect','A text venerated long after it was understood.'],
  ['veracity','truthfulness','The veracity of the account is not in question.'],
  ['vex','to annoy or puzzle','A detail that vexed the team for weeks.'],
  ['vindicate','to clear of blame; to justify','Later trials vindicated the original hypothesis.'],
  ['vitiate','to spoil or make ineffective','One omission vitiated the entire analysis.'],
  ['volatile','liable to sudden change','A volatile market with no stable reference price.'],
  ['zealous','showing great energy for a cause','A zealous advocate of open publication.'],
];

const MATHFACTS = [
  ['Divisor count of n','Prime factorize, add 1 to each exponent, multiply. 36 = 2²·3² → (2+1)(2+1) = 9.'],
  ['GCD × LCM','GCD(a,b) × LCM(a,b) = a × b. Know one and you get the other free.'],
  ['Primes above 3','Always of the form 6k ± 1. Therefore p² ≡ 1 (mod 12).'],
  ['Perfect square exponents','Every prime exponent is even. Also: perfect squares have an odd number of divisors.'],
  ['Trailing zeros in n!','Count the 5s: ⌊n/5⌋ + ⌊n/25⌋ + ⌊n/125⌋ + …'],
  ['(x + y)²','x² + 2xy + y². The cross term is what converts sums to products.'],
  ['x² − y²','(x + y)(x − y).'],
  ['x³ + y³ (from s and p)','(x+y)³ − 3xy(x+y).'],
  ['x + 1/x squared','x² + 2 + 1/x². The middle term is always exactly 2.'],
  ['Sum/product of roots','For ax² + bx + c = 0: sum = −b/a, product = c/a.'],
  ['Arithmetic sequence nth term','aₙ = a₁ + (n − 1)d. Steps are n − 1, not n.'],
  ['Sum of a sequence','count × (first + last) ÷ 2.'],
  ['Sum 1 to n','n(n + 1)/2.'],
  ['Evenly spaced sets','mean = median = average of the endpoints.'],
  ['Standard deviation under +c','Unchanged. Under ×k it scales by |k|; variance by k².'],
  ['Combination formula','C(n,k) = n! / (k!(n−k)!).'],
  ['Handshakes among n people','n(n−1)/2.'],
  ['Repeated letters','Divide by the factorial of each repeat count. LEVEL = 5!/(2!2!) = 30.'],
  ['n!/(n−k)!','The top k consecutive integers multiplied.'],
  ['At least one','1 − P(none). Almost always faster than summing cases.'],
  ['Without replacement','Both numerator and denominator drop by one each draw.'],
  ['Two dice','36 ordered outcomes. Sum of 8 occurs 5 ways.'],
  ['30-60-90','x : x√3 : 2x, with x opposite the 30°.'],
  ['45-45-90','x : x : x√2.'],
  ['Pythagorean triples','3-4-5, 5-12-13, 8-15-17, 7-24-25, and all their multiples.'],
  ['Circle inscribed in a square','diameter = side. Circumscribed: diameter = side√2.'],
  ['Chord equal to the radius','Subtends 60°; the triangle is equilateral.'],
  ['Angle in a semicircle','Always 90°. If the diameter is a side, the triangle is right.'],
  ['Interior angles of an n-gon','(n − 2) × 180.'],
  ['Box diagonal','√(l² + w² + h²).'],
  ['Similar figures','Lengths scale by k, areas by k², volumes by k³.'],
  ['Successive percent change','Multiply the factors. Up x% then down x% = 1 − x².'],
  ['Reversal pairs','+1/n is undone by −1/(n+1). +25% undone by −20%.'],
  ['Margin on price vs cost','On price: S = C/(1 − m). On cost: S = C(1 + m). Different answers.'],
  ['Combined work rate','1/a + 1/b. Invert only at the end. Opposing rates subtract.'],
  ['Average speed, equal distances','2ab/(a+b), the harmonic mean. Never the plain average.'],
  ['Inclusion-exclusion','|A∪B| = |A| + |B| − |A∩B|. For "or" divisibility, the overlap is the LCM.'],
  ['Alligation','Mixing a and b to reach c: volumes are in ratio (b−c) : (c−a).'],
  ['Inclusive counting','last − first + 1.'],
  ['Compound growth over n periods','Per-period rate = M^(1/n) − 1. Doubling in 2 years ≈ 41%/yr.'],
  ['0 < x < 1 ordering','x² < x < √x. Reverses above 1.'],
  ['Perpendicular slopes','Multiply to −1.'],
  ['Slope','(y₂ − y₁)/(x₂ − x₁). Same order top and bottom.'],
];

const METHODCARDS = [
  ['Text completion: first move','Predict your own word before reading any choice. Then match.'],
  ['Same-direction signals','moreover, indeed, in fact, thus, because, since, consequently.'],
  ['Reverse-direction signals','although, despite, yet, however, far from, rather than, nonetheless, paradoxically.'],
  ['Colon or semicolon','The two halves agree. The second defines or explains the first.'],
  ['"So … that"','The blank is defined by its consequence. Read the result clause first.'],
  ['"Less a X than a Y"','Y is the near-opposite of X. Built-in antonym clue.'],
  ['"Not merely X but Y"','Y escalates X. Look for a stronger word, not a synonym.'],
  ['"Once … now"','A timeline reversal. Choices describing the present state are traps for the past blank.'],
  ['Multi-blank strategy','Solve the best-supported blank first, then let it constrain the rest. All-or-nothing scoring.'],
  ['Sentence equivalence: the rule','You need a synonym pair, not two words that merely fit.'],
  ['SE: no partner, no answer','A word that fits perfectly but has no match among the six is wrong by structure.'],
  ['SE: match intensity','"Not overturned outright, but ___" wants a milder word, not the opposite.'],
  ['RC: what to read for','The author\'s claim, the pivot where they turn against something, and each paragraph\'s job.'],
  ['RC: purpose questions','The answer must cover the whole passage. A choice naming one true detail is a scope trap.'],
  ['RC: "in order to"','Asks for function, not content. Reread the sentences immediately around the cited detail.'],
  ['RC: inference','Must be forced by the text. Prefer hedged wording — suggests, may, incomplete — over absolutes.'],
  ['RC: the pivot words','but, however, in fact, yet. The thesis usually sits in those sentences.'],
  ['CR: find the gap','Identify the conclusion, then the gap between evidence and conclusion. Every choice lives there.'],
  ['CR: three causal attacks','Alternative cause, reversed causation, or coincidence. Nothing else weakens causation.'],
  ['CR: assumption test','Negate the choice. If the conclusion collapses, it was necessary.'],
  ['CR: scope shift','Evidence about one cost, conclusion about total cost. The assumption closes that gap.'],
  ['CR: "must be true"','A modest restatement. Anything adding causation, guarantee, or prediction is wrong.'],
  ['CR: all A are B','Makes B necessary for A, not sufficient. The reversal is the most-tested error.'],
  ['CR: selection effects','A self-selected sample cannot support a claim about the general population.'],
  ['CR: rate falls, count rises','Suspect a change in who enters the denominator.'],
  ['QC: when is D right?','Only if you can actually construct two different cases. Try 0, 1, a fraction, and a negative.'],
  ['QC: legal moves','You may add or subtract the same term from both quantities. Multiply only if you know the sign.'],
  ['DS: the discipline','Read statement 2 as if you never saw statement 1. Cover it physically.'],
  ['DS: test cases','Negatives, zero, one, fractions, large values. Not random numbers.'],
  ['DS: why C is over-chosen','Confirm each statement truly fails alone AND that together they pin one value.'],
];

function buildDeck() {
  const out = [];
  VOCAB.forEach(([w, d, s], i) => out.push({ id: 'v' + i, deck: 'vocab', front: w, back: d, note: s }));
  MATHFACTS.forEach(([f, b], i) => out.push({ id: 'm' + i, deck: 'math', front: f, back: b }));
  METHODCARDS.forEach(([f, b], i) => out.push({ id: 'k' + i, deck: 'method', front: f, back: b }));
  return out;
}
const FLASHCARDS = buildDeck();

const FORMATS = {
  GRE: {
    name: 'GRE General Test',
    since: 'Shortened format, in effect since September 2023',
    total: '1 hour 58 minutes · 55 questions · no scheduled breaks',
    scale: 'Verbal 130–170 · Quant 130–170 · Writing 0–6',
    rows: [
      ['Analytical Writing', '1 task', '30 min', 'Analyze an Issue only'],
      ['Quantitative ×2', '12 + 15 = 27', '21 + 26 min', 'QC, multiple choice, numeric entry, data interpretation'],
      ['Verbal ×2', '12 + 15 = 27', '18 + 23 min', 'Text completion, sentence equivalence, reading comp'],
    ],
    notes: [
      'Analytical Writing always comes first; the Verbal and Quant sections then follow in any order.',
      'Section-level adaptive: how you do on the first section of a measure sets the difficulty of the second.',
      'The Analyze an Argument essay and the unscored experimental section were both removed.',
      'On-screen basic calculator in Quant. No penalty for wrong answers, so never leave a blank.',
    ],
  },
  GMAT: {
    name: 'GMAT (Focus Edition)',
    since: 'Launched November 2023 — now simply called "the GMAT"',
    total: '2 hours 15 minutes · 64 questions · one optional 10-minute break',
    scale: 'Total 205–805 · each section 60–90, equally weighted',
    rows: [
      ['Quantitative', '21', '45 min', 'Problem solving only'],
      ['Verbal', '23', '45 min', 'Reading comp and critical reasoning'],
      ['Data Insights', '20', '45 min', 'Data sufficiency, table analysis, two-part, multi-source, graphics'],
    ],
    notes: [
      'Data sufficiency moved out of Quant and into Data Insights — it is no longer a quant question type.',
      'Geometry was removed from Quant entirely. No triangles, circles, or solids. Do not study it.',
      'Sentence correction was removed from Verbal, and the AWA essay was removed completely.',
      'Sections can be taken in any order. On-screen calculator in Data Insights only.',
      '205–805 does not map onto the old 200–800 scale: a 645 is roughly a former 700.',
    ],
  },
};

function Format({ exam }) {
  const f = FORMATS[exam];
  return (
    <div style={{ marginTop: 26 }}>
      <h2 className="h2">{f.name} — current format</h2>
      <p className="sub" style={{ marginBottom: 12 }}>{f.since}</p>
      <div className="card pad">
        <div className="fmt-top">
          <div><span className="lbl">Length</span><div className="fmt-v">{f.total}</div></div>
          <div><span className="lbl">Scoring</span><div className="fmt-v">{f.scale}</div></div>
        </div>
        <div className="tblwrap" style={{ marginTop: 14 }}>
          <table className="tbl">
            <thead><tr>
              <th scope="col">Section</th><th scope="col">Qs</th><th scope="col">Time</th><th scope="col">Contains</th>
            </tr></thead>
            <tbody>
              {f.rows.map((r, i) => (
                <tr key={i}>
                  <th scope="row">{r[0]}</th><td>{r[1]}</td><td>{r[2]}</td>
                  <td style={{ textAlign: 'left', whiteSpace: 'normal', minWidth: 150 }}>{r[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="lesson-list" style={{ marginTop: 12, marginBottom: 0 }}>
          {f.notes.map((n, i) => <li key={i}>{n}</li>)}
        </ul>
      </div>
      <div className="gauge-note" style={{ padding: '10px 2px 0' }}>
        Pacing targets in this app are derived from these timings. Verify current details at
        ets.org/gre or mba.com before test day — formats do change.
      </div>
    </div>
  );
}

const CHALLENGE_NOTE = {
  ramp: 'Starts easy and stays there. Use this only to rebuild a topic from scratch.',
  adaptive: 'Tracks your measured ability and sits just above it. Moves as you move.',
  hard: 'Difficulty 4–5 weighted, ignoring your current estimate. The band a 170 is won in.',
  brutal: 'Difficulty 5 only. Expect to miss some — that is the point.',
};

const TYPE_NAMES = {
  QC:'Quantitative comparison', PS:'Problem solving', NE:'Numeric entry',
  DI:'Data interpretation', TC:'Text completion', SE:'Sentence equivalence',
  RC:'Reading comprehension', DS:'Data sufficiency', CR:'Critical reasoning',
};

/* ------------------------------------------------------------
   Pacing targets derived from the actual 2026 section timings,
   not from estimates.

   GRE General Test (shortened format, in effect since Sept 2023):
     Quant  — 27 questions across two sections (12 in 21 min,
              15 in 26 min) = 47 min → ~104 s per question
     Verbal — 27 questions across two sections (12 in 18 min,
              15 in 23 min) = 41 min → ~91 s per question

   GMAT (Focus Edition, now simply "the GMAT"):
     three independently timed 45-minute sections
     Quant         — 21 questions → ~128 s
     Verbal        — 23 questions → ~117 s
     Data Insights — 20 questions → ~135 s

   Within a section the averages are adjusted by type: reading
   comprehension and data sets legitimately take longer, so the
   short types must run faster to fund them.
------------------------------------------------------------ */
const PACE = {
  // GRE — section average 104 s quant, 91 s verbal
  QC:85, PS:105, NE:110, DI:120,
  TC:75, SE:60, RC:105,
  // GMAT — section average 128 s quant, 117 s verbal, 135 s data insights
  DS:135, CR:117,
};
const paceFor = q => {
  if (q.exam === 'GMAT') {
    if (q.type === 'PS') return 128;
    if (q.type === 'CR') return 117;
    if (q.type === 'DS' || q.type === 'DI') return 135;
    return 128;
  }
  return PACE[q.type] || 104;
};

/* ============================================================
   SCORING — Rasch ability estimate with a shrinking interval
   ============================================================ */

function estimate(records) {
  // records: [{d, correct}]
  if (!records.length) return null;
  let best = 3, bestLL = -Infinity;
  for (let t = 0; t <= 6.001; t += 0.05) {
    let ll = 0;
    for (const r of records) {
      const p = 1 / (1 + Math.exp(-(t - r.d)));
      ll += Math.log(Math.max(r.correct ? p : 1 - p, 1e-9));
    }
    // gentle prior toward the middle so 3 straight wins don't read as a 170
    ll += -0.5 * Math.pow((t - 3) / 2.2, 2);
    if (ll > bestLL) { bestLL = ll; best = t; }
  }
  let info = 0.2;
  for (const r of records) {
    const p = 1 / (1 + Math.exp(-(best - r.d)));
    info += p * (1 - p);
  }
  return { theta: best, se: 1 / Math.sqrt(info) };
}

const SCALES = {
  'GRE:Quant':  { lo:130, hi:170, goal:170, goalLabel:'Target', name:'GRE Quantitative' },
  'GRE:Verbal': { lo:130, hi:170, goal:170, goalLabel:'Target', name:'GRE Verbal' },
  'GMAT:total': { lo:205, hi:805, goal:645, goalLabel:'Target', name:'GMAT total' },
};

function toScale(theta, key) {
  const s = SCALES[key];
  const frac = Math.min(1, Math.max(0, theta / 6));
  return s.lo + (s.hi - s.lo) * frac;
}

/* ============================================================
   STORAGE
   ============================================================ */

/* ============================================================
   ADAPTIVE ENGINE — Leitner scheduling with pace-gated mastery
   A question only advances when answered correctly AND within
   its pacing target. Perfect scores are lost to slow-but-right
   as often as to wrong, so the schedule treats them differently.
   ============================================================ */

const DAY = 86400000;
const BOX_DAYS = [0, 1, 3, 7, 21, 60];   // interval by box
const MASTER_BOX = 4;                     // box 4+ counts as mastered

const ERRORS = [
  { k:'careless', label:'Careless slip',   hint:'Knew the method, made an arithmetic or transcription error' },
  { k:'misread',  label:'Misread it',      hint:'Answered a question the prompt did not ask' },
  { k:'concept',  label:'Concept gap',     hint:'Did not know the rule or approach' },
  { k:'time',     label:'Rushed',          hint:'Ran long, then guessed or cut corners' },
  { k:'guess',    label:'Pure guess',      hint:'No real approach at all' },
];
const ERROR_LABEL = Object.fromEntries(ERRORS.map(e => [e.k, e.label]));

const newCard = () => ({ b:0, due:0, s:0, l:0, slow:0, errs:{} });

function updateCard(card, { correct, ms, target, tag }) {
  const c = { ...newCard(), ...(card || {}), errs: { ...(card?.errs || {}) } };
  const onPace = ms <= target * 1.15;
  const now = Date.now();
  if (!correct) {
    c.b = 0; c.s = 0; c.l += 1; c.due = now;
    if (tag) c.errs[tag] = (c.errs[tag] || 0) + 1;
    c.lastTag = tag || null;
  } else if (!onPace) {
    // right but slow: no promotion, short interval, flagged for pacing work
    c.b = Math.max(1, c.b); c.s += 1; c.slow += 1; c.due = now + DAY;
  } else {
    c.b = Math.min(5, c.b + 1); c.s += 1; c.due = now + BOX_DAYS[c.b] * DAY;
  }
  c.seen = (c.seen || 0) + 1;
  c.lastMs = ms; c.lastOk = correct; c.lastAt = now;
  return c;
}

const isMastered = c => !!c && c.b >= MASTER_BOX;
const isDue = c => !!c && c.b < MASTER_BOX && c.due <= Date.now();

const MODES = {
  due:      { t:'Due for review',   d:'Questions the scheduler says are ready to come back, oldest first.' },
  ceiling:  { t:'Ceiling drill',    d:'Difficulty 4 and 5 only. This is the band that decides a perfect score.' },
  careless: { t:'Careless rerun',   d:'Questions you missed by slipping or misreading, not by not knowing.' },
  slow:     { t:'Beat the clock',   d:'Questions you got right but over the pacing target.' },
  weak:     { t:'Weak topics',      d:'Topics below 90% accuracy, which is the threshold a perfect score demands.' },
  unseen:   { t:'New questions',    d:'Questions you have not attempted yet, hardest first.' },
  mixed:    { t:'Mixed set',        d:'Adaptive blend: due reviews first, then weak spots, then new material.' },
  quant:    { t:'Quant only',       d:'' },
  verbal:   { t:'Verbal & data',    d:'' },
};

const KEY = 'calibrate:v2';
const blank = () => ({ attempts: [], cards: {}, exam: 'GRE', goal: 'perfect', challenge: 'hard' });

/* ------------------------------------------------------------
   Storage layer.

   Three failure modes are handled here, because all three were
   producing "cannot access" errors in practice:
     1. window.storage missing entirely (sandboxed / restricted view)
     2. rate limiting from writing on every single answer
     3. transient failures that should not lose a session

   Strategy: keep the authoritative copy in memory, write through
   on a debounce, retry with backoff, and never let a storage
   failure reach the UI as an exception.
------------------------------------------------------------ */

const store = {
  ok: null,          // null = untested, true/false once known
  mem: null,         // in-memory mirror, always authoritative
  timer: null,
  pending: null,
  inflight: false,
  retries: 0,
  listeners: new Set(),
};

const storageAvailable = () => {
  try { return typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function'; }
  catch { return false; }
};

function notify() { store.listeners.forEach(fn => { try { fn(store.ok); } catch {} }); }

async function loadState() {
  if (!storageAvailable()) {
    store.ok = false; notify();
    return store.mem || blank();
  }
  try {
    const r = await window.storage.get(KEY);
    store.ok = true; notify();
    if (r && r.value) {
      const parsed = JSON.parse(r.value);
      store.mem = { ...blank(), ...parsed };
      return store.mem;
    }
  } catch (e) {
    // A missing key throws rather than returning null, so this is the
    // normal first-run path. Only a thrown *availability* error matters.
    store.ok = storageAvailable();
    notify();
  }
  store.mem = store.mem || blank();
  return store.mem;
}

/* Trim the payload before writing. Attempts are only used for
   aggregates, so old ones cost size without buying anything. */
function serialize(s) {
  const trimmed = {
    ...s,
    attempts: (s.attempts || []).slice(-500).map(a => ({
      id:a.id, d:a.d, exam:a.exam, section:a.section, topic:a.topic,
      correct:a.correct, ms:a.ms, target:a.target, tag:a.tag, ts:a.ts,
    })),
  };
  return JSON.stringify(trimmed);
}

async function flushNow() {
  if (store.inflight || !store.pending) return;
  if (!storageAvailable()) { store.ok = false; notify(); return; }
  const payload = store.pending;
  store.pending = null;
  store.inflight = true;
  try {
    await window.storage.set(KEY, payload);
    store.inflight = false;
    store.retries = 0;
    if (store.ok !== true) { store.ok = true; notify(); }
    if (store.pending) scheduleSave();     // coalesce anything queued mid-write
  } catch (e) {
    store.inflight = false;
    // Put it back and back off — most failures here are rate limits.
    store.pending = store.pending || payload;
    store.retries += 1;
    if (store.retries <= 5) {
      const wait = Math.min(30000, 1500 * Math.pow(2, store.retries - 1));
      clearTimeout(store.timer);
      store.timer = setTimeout(flushNow, wait);
    } else {
      store.ok = false; notify();
    }
  }
}

function scheduleSave() {
  clearTimeout(store.timer);
  store.timer = setTimeout(flushNow, 2500);
}

/* Called on every state change. Cheap: updates memory, debounces the write. */
function saveState(s) {
  store.mem = s;
  try { store.pending = serialize(s); } catch { return; }
  scheduleSave();
}

/* Force a write at natural boundaries (finishing a set, leaving the app). */
function flushSoon() { clearTimeout(store.timer); flushNow(); }

/* ============================================================
   SMALL UTILITIES
   ============================================================ */

const fmtClock = ms => {
  const t = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
};
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const eq = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

function optionsFor(q) {
  if (q.type === 'QC') return QC_CHOICES;
  if (q.type === 'DS') return DS_CHOICES;
  return q.choices || [];
}

function isCorrect(q, resp) {
  if (resp == null) return false;
  if (q.type === 'NE') {
    const v = parseFloat(String(resp).replace(/[^0-9.\-]/g, ''));
    return Number.isFinite(v) && Math.abs(v - parseFloat(q.answer)) < 1e-6;
  }
  if (q.type === 'SE') return Array.isArray(resp) && eq([...resp].sort((x, y) => x - y), [...q.answer].sort((x, y) => x - y));
  if (q.blanks) return Array.isArray(resp) && q.blanks.every((b, i) => resp[i] === b.answer);
  return resp === q.answer;
}

function respComplete(q, resp) {
  if (resp == null) return false;
  if (q.type === 'NE') return String(resp).trim().length > 0;
  if (q.type === 'SE') return Array.isArray(resp) && resp.length === 2;
  if (q.blanks) return Array.isArray(resp) && resp.length === q.blanks.length && resp.every(v => v != null);
  return typeof resp === 'number';
}

/* ============================================================
   COMPONENTS
   ============================================================ */

function Gauge({ scaleKey, records }) {
  const s = SCALES[scaleKey];
  const est = estimate(records);
  const pct = v => ((v - s.lo) / (s.hi - s.lo)) * 100;

  const ticks = [];
  const step = (s.hi - s.lo) / 8;
  for (let i = 0; i <= 8; i++) {
    const v = s.lo + step * i;
    ticks.push(
      <React.Fragment key={i}>
        <div className={'tick' + (i % 2 === 0 ? ' major' : '')} style={{ left: `${pct(v)}%` }} />
        {i % 2 === 0 && <div className="tick-num" style={{ left: `${pct(v)}%` }}>{Math.round(v)}</div>}
      </React.Fragment>
    );
  }

  let body;
  if (!est || records.length < 4) {
    body = <div className="gauge-note">Answer {4 - records.length} more {scaleKey === 'GMAT:total' ? 'GMAT' : s.name.split(' ')[1].toLowerCase()} question{4 - records.length === 1 ? '' : 's'} to calibrate.</div>;
  } else {
    const score = toScale(est.theta, scaleKey);
    const halfW = Math.max(est.se * ((s.hi - s.lo) / 6), (s.hi - s.lo) * 0.02);
    const lo = Math.max(s.lo, score - halfW), hi = Math.min(s.hi, score + halfW);
    const round = scaleKey === 'GMAT:total' ? 10 : 1;
    const show = Math.round(score / round) * round;
    const pm = Math.round(halfW / round) * round;
    body = (
      <>
        <div className="scale" role="img" aria-label={`Estimated ${s.name}: ${Math.round(score/round)*round}, range ${Math.round(lo)} to ${Math.round(hi)}, target ${s.goal}`}>
          <div className="scale-axis" aria-hidden="true" />
          {ticks}
          <div className="band" style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }} />
          <div className="needle" style={{ left: `${pct(score)}%` }} />
          <div className="goal" data-edge={pct(s.goal) > 92 ? 1 : 0} style={{ left: `${pct(s.goal)}%` }}>
            <div className="goal-lbl">{s.goalLabel} {s.goal}</div>
          </div>
        </div>
        <div className="gauge-note">
          {records.length} question{records.length === 1 ? '' : 's'} · interval narrows as you answer more ·
          {score >= s.goal ? ' at or above target' : ` ${Math.round((s.goal - score) / round) * round} below target`}
        </div>
      </>
    );
  }

  const score = est && records.length >= 4 ? toScale(est.theta, scaleKey) : null;
  const round = scaleKey === 'GMAT:total' ? 10 : 1;

  return (
    <div className="gauge">
      <div className="gauge-head">
        <div className="gauge-name">{s.name}</div>
        {score != null && (
          <>
            <div className="gauge-val">{Math.round(score / round) * round}</div>
          </>
        )}
      </div>
      {body}
    </div>
  );
}

function Question({ q, resp, setResp, revealed }) {
  const opts = optionsFor(q);
  const graded = revealed;
  const [view, setView] = useState('p');
  useEffect(() => { setView('p'); }, [q.id]);

  const pick = i => {
    if (graded) return;
    if (q.type === 'SE') {
      const cur = Array.isArray(resp) ? resp : [];
      if (cur.includes(i)) setResp(cur.filter(v => v !== i));
      else if (cur.length < 2) setResp([...cur, i]);
      else setResp([cur[1], i]);
    } else setResp(i);
  };

  const pickBlank = (bi, oi) => {
    if (graded) return;
    const cur = Array.isArray(resp) ? [...resp] : new Array(q.blanks.length).fill(null);
    cur[bi] = oi;
    setResp(cur);
  };

  const stateOf = (i) => {
    if (!graded) return undefined;
    const isAns = q.type === 'SE' ? q.answer.includes(i) : q.answer === i;
    const chosen = q.type === 'SE' ? (resp || []).includes(i) : resp === i;
    if (isAns) return 'ok';
    if (chosen) return 'bad';
    return undefined;
  };

  return (
    <div className={q.passage ? 'rcsplit' : undefined}>
      {q.passage && (
        <div className="ptabs" role="tablist">
          <button role="tab" aria-selected={view === 'p'} data-on={view === 'p' ? 1 : 0}
            onClick={() => setView('p')}>Passage</button>
          <button role="tab" aria-selected={view === 'q'} data-on={view === 'q' ? 1 : 0}
            onClick={() => setView('q')}>Question</button>
        </div>
      )}

      {q.passage && (
        <div className="passage" data-hide={q.passage && view === 'q' ? 1 : 0}>{PASSAGES[q.passage]}</div>
      )}

      <div data-hide={q.passage && view === 'p' ? 1 : 0}>
      {q.table && (() => {
        const t = TABLES[q.table];
        return (
          <div className="tblwrap">
            <table className="tbl">
              <caption>{t.caption}</caption>
              <thead><tr>{t.head.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr></thead>
              <tbody>{t.rows.map((r, i) => <tr key={i}>{r.map((c, j) => j === 0
                  ? <th key={j} scope="row">{c}</th>
                  : <td key={j}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        );
      })()}

      {q.stem && <div className="stem">{q.stem.split('\n').map((l, i) => <div key={i} style={{ marginTop: i ? 6 : 0 }}>{l}</div>)}</div>}

      {q.type === 'QC' && (
        <div className="qc-grid">
          <div className="qc-cell"><div className="qc-lbl">Quantity A</div><div className="qc-val">{q.qa}</div></div>
          <div className="qc-cell"><div className="qc-lbl">Quantity B</div><div className="qc-val">{q.qb}</div></div>
        </div>
      )}

      {q.type === 'SE' && <div className="lbl" style={{ marginBottom: 8 }}>Select exactly two answers</div>}

      {q.blanks ? (
        <div className={'blanks' + (q.blanks.length > 1 ? ' multi' : '')}>
          {q.blanks.map((b, bi) => (
            <div className="blank-col" key={bi}>
              <div className="blank-h">{b.label}</div>
              {b.choices.map((c, oi) => {
                const sel = Array.isArray(resp) && resp[bi] === oi;
                let st;
                if (graded) { if (oi === b.answer) st = 'ok'; else if (sel) st = 'bad'; }
                return (
                  <button key={oi} className="blank-o" data-sel={sel ? 1 : 0} data-state={st}
                    role="radio" aria-checked={sel}
                    disabled={graded} onClick={() => pickBlank(bi, oi)}>
                    {c}
                    {graded && st === 'ok' && <span className="sr-only">(correct)</span>}
                    {graded && st === 'bad' && <span className="sr-only">(your answer, incorrect)</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : q.type === 'NE' ? (
        <div>
          <label className="lbl" htmlFor={'ne-' + q.id} style={{ display:'block', marginBottom:6 }}>
            Your answer
          </label>
          <input id={'ne-' + q.id} className="ne-in" value={resp ?? ''} disabled={graded}
            inputMode="decimal" autoComplete="off"
            onChange={e => setResp(e.target.value)} />
        </div>
      ) : (
        <div className="opts" role={q.type === 'SE' ? 'group' : 'radiogroup'} aria-label="Answer choices">
          {opts.map((c, i) => {
            const sel = q.type === 'SE' ? (resp || []).includes(i) : resp === i;
            return (
              <button key={i} className="opt" data-sel={sel ? 1 : 0} data-state={stateOf(i)}
                role={q.type === 'SE' ? 'checkbox' : 'radio'} aria-checked={sel}
                disabled={graded} onClick={() => pick(i)}>
                <span className="opt-k" aria-hidden="true">{String.fromCharCode(65 + i)}</span>
                <span>{c}</span>
                {graded && stateOf(i) === 'ok' && <span className="sr-only">(correct answer)</span>}
                {graded && stateOf(i) === 'bad' && <span className="sr-only">(your answer, incorrect)</span>}
                {graded && <span className="optmark" aria-hidden="true">
                  {stateOf(i) === 'ok' ? '\u2713' : stateOf(i) === 'bad' ? '\u2715' : ''}</span>}
              </button>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}


/* ============================================================
   GLOSSARY + ONBOARDING
   Definitions are click/keyboard disclosures, not hover flyovers:
   hover-only tooltips are unusable on touch and fail WCAG 2.1
   (1.4.13 needs them dismissible, hoverable, and persistent).
   ============================================================ */

const GLOSSARY = {
  'calibration': 'An estimate of your scaled score based on which difficulties you get right, not just how many. Getting a hard question right moves it far more than an easy one.',
  'confidence interval': 'The shaded band around your estimate. It shows the range your true score probably falls in. It starts wide and narrows as you answer more questions.',
  'pacing target': 'The time a question of this type should take on the real exam. Text completion gets 75 seconds; data sufficiency gets 135. Beating it matters as much as getting the answer right.',
  'mastered': 'A question you have answered correctly and within the pacing target four separate times, across growing gaps. One correct answer is not mastery.',
  'box': 'Your progress level on a single question, from 0 to 5. Correct and on pace moves it up one; a miss resets it to 0. Higher boxes mean longer gaps before the question returns.',
  'due': 'A question the schedule has decided is ready to come back. Reviewing it right as you are about to forget is what makes the memory stick.',
  'spaced repetition': 'Reviewing material at growing intervals — one day, then three, then seven, then twenty-one. It produces far more durable recall than repeated cramming.',
  'difficulty': 'A 1-to-5 rating shown as dots. Difficulty 4 and 5 are the band that decides whether you land a perfect score.',
  'challenge level': 'How hard a set you want. Adaptive follows your measured ability; Hard and Brutal ignore it and serve difficulty 4-5 regardless.',
  'error tag': 'Your own diagnosis of why you missed a question. Careless slips and concept gaps need completely different fixes, so the app tracks them separately.',
  'quantitative comparison': 'A GRE-only format. You compare two quantities and choose whether A is bigger, B is bigger, they are equal, or it cannot be determined. The fourth option is right only if you can construct two genuinely different cases.',
  'data sufficiency': 'A GMAT-only format. You decide whether the statements give enough information to answer — you never actually compute the answer. Judging sufficiency is the whole skill.',
  'sentence equivalence': 'A GRE format where you pick two words from six that give the sentence the same meaning. You need a matching pair, not just two words that fit.',
  'numeric entry': 'A GRE format with no answer choices. You type the number, so you cannot work backwards from options or eliminate.',
  'ceiling drill': 'A set drawn only from difficulty 4 and 5 questions you have not yet mastered. This is where the last few points live.',
};

function Term({ k, children }) {
  const [open, setOpen] = useState(false);
  const def = GLOSSARY[k];
  if (!def) return <>{children}</>;
  return (
    <span className="termwrap">
      <button className="term" aria-expanded={open} onClick={() => setOpen(!open)}>
        {children || k}<span className="term-i" aria-hidden="true">?</span>
        <span className="sr-only">{open ? ' hide definition' : ' show definition'}</span>
      </button>
      {open && (
        <span className="termdef" role="note">
          {def}
          <button className="termclose" onClick={() => setOpen(false)}>Close</button>
        </span>
      )}
    </span>
  );
}

const STEPS = [
  { t:'Answer, then diagnose',
    d:'Pick an answer and submit. If you miss it, you must tag why — careless slip, misread, concept gap, rushed, or guess. That tag is what makes the app useful rather than just a question list.' },
  { t:'Speed counts as much as accuracy',
    d:'Every question has a pacing target. A correct answer delivered too slowly does not advance — it comes back tomorrow. Right-but-slow is what separates a 165 from a 170.' },
  { t:'The schedule decides what returns',
    d:'Miss a question and it resets. Get it right on pace and the gap before you see it again grows: one day, three, seven, twenty-one. Four clean repetitions makes it mastered.' },
  { t:'Start from the readiness panel',
    d:'The home screen lists your actual blockers in priority order. Tap the top row rather than picking a mode yourself — it already knows what is costing you most.' },
  { t:'Read the method guides when stuck',
    d:'The Learn tab has a guide per topic with the rules, a worked example, and a "go deeper" section explaining why each shortcut is true. Every guide has a button to drill that topic immediately.' },
];

function Guide({ onClose, first }) {
  const [i, setI] = useState(0);
  const last = i === STEPS.length - 1;
  return (
    <div className="guidewrap" role="dialog" aria-modal="true" aria-labelledby="guide-title">
      <div className="guide">
        <div className="guide-k">{first ? 'Getting started' : 'How this works'} · {i + 1} of {STEPS.length}</div>
        <h2 className="guide-t" id="guide-title">{STEPS[i].t}</h2>
        <p className="guide-d">{STEPS[i].d}</p>
        <div className="guide-dots" aria-hidden="true">
          {STEPS.map((_, k) => <i key={k} data-on={k === i ? 1 : 0} />)}
        </div>
        <div className="guide-btns">
          {i > 0 && <button className="btn ghost" onClick={() => setI(i - 1)}>Back</button>}
          <button className="btn grow" onClick={() => last ? onClose() : setI(i + 1)}>
            {last ? 'Start practising' : 'Next'}
          </button>
        </div>
        <button className="guide-skip" onClick={onClose}>
          {first ? 'Skip — I will figure it out' : 'Close'}
        </button>
      </div>
    </div>
  );
}

function Flash({ cards, onRate, exam }) {
  const [deck, setDeck] = useState('vocab');
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);

  const pool = useMemo(() => {
    const all = FLASHCARDS.filter(c => c.deck === deck);
    const rank = c => {
      const k = cards['fc:' + c.id];
      if (!k) return 1;                       // unseen
      if (isMastered(k)) return 3;
      if (k.due <= Date.now()) return 0;      // due first
      return 2;
    };
    return [...all].sort((a, b) => rank(a) - rank(b) || Math.random() - 0.5);
  }, [deck, cards, done]);

  const card = pool[i % Math.max(1, pool.length)];
  const stat = card ? cards['fc:' + card.id] : null;

  const rate = (quality) => {
    if (!card) return;
    onRate(card, quality);
    setFlipped(false);
    setI(i + 1);
    setDone(done + 1);
  };

  const deckStats = d => {
    const all = FLASHCARDS.filter(c => c.deck === d);
    const m = all.filter(c => isMastered(cards['fc:' + c.id])).length;
    const due = all.filter(c => { const k = cards['fc:' + c.id]; return k && !isMastered(k) && k.due <= Date.now(); }).length;
    return { total: all.length, m, due };
  };

  useEffect(() => { setI(0); setFlipped(false); }, [deck]);

  return (
    <div style={{ marginTop: 22 }}>
      <h2 className="h2">Flashcards</h2>
      <p className="sub" style={{ marginBottom: 14 }}>
        Same scheduler as the questions: rate yourself honestly and the intervals take care of
        themselves. Vocabulary is the largest deck because text completion and sentence
        equivalence are, in practice, vocabulary tests.
      </p>

      <div className="deckpick" role="group" aria-label="Choose a deck">
        {Object.entries(DECKS).map(([k, d]) => {
          const st = deckStats(k);
          return (
            <button key={k} aria-pressed={deck === k} data-on={deck === k ? 1 : 0}
              className="deckbtn" onClick={() => setDeck(k)}>
              <span className="deckbtn-n">{d.name}</span>
              <span className="deckbtn-s">
                {st.m}/{st.total} known{st.due > 0 ? ` · ${st.due} due` : ''}
              </span>
            </button>
          );
        })}
      </div>
      <p className="gauge-note" style={{ margin: '8px 2px 14px' }}>{DECKS[deck].sub}</p>

      {card && (
        <>
          <div className="fcard">
            <div className="fcard-k">
              {deck === 'vocab' ? 'Define this word' : 'Recall this'}
              {stat && isMastered(stat) && <span className="fcard-badge">known</span>}
              {stat && !isMastered(stat) && stat.due <= Date.now() && <span className="fcard-badge due">due</span>}
            </div>
            <div className="fcard-front">{card.front}</div>

            {flipped ? (
              <div className="fcard-back" role="status" aria-live="polite">
                <div className="fcard-def">{card.back}</div>
                {card.note && <div className="fcard-note">{card.note}</div>}
              </div>
            ) : (
              <button className="btn" style={{ width: '100%', marginTop: 16 }}
                onClick={() => setFlipped(true)}>Show answer</button>
            )}
          </div>

          {flipped && (
            <>
              <div className="lbl" style={{ margin: '14px 0 8px' }}>How well did you know it?</div>
              <div className="ratebtns">
                <button className="ratebtn" data-r="again" onClick={() => rate('again')}>
                  <b>No idea</b><span>see it again today</span>
                </button>
                <button className="ratebtn" data-r="hard" onClick={() => rate('hard')}>
                  <b>Shaky</b><span>had to think hard</span>
                </button>
                <button className="ratebtn" data-r="good" onClick={() => rate('good')}>
                  <b>Knew it</b><span>came back cleanly</span>
                </button>
              </div>
            </>
          )}

          <div className="gauge-note" style={{ padding: '12px 2px 0' }}>
            {done} reviewed this session · {pool.length} cards in this deck
          </div>
        </>
      )}
    </div>
  );
}
function Lesson({ topic, compact, onPractice }) {
  const l = LESSONS[topic];
  const deep = DEEP[topic] || [];
  const [openDeep, setOpenDeep] = useState(false);
  if (!l) return null;
  return (
    <div className={compact ? 'lesson lesson-in' : 'lesson'}>
      <div className="lesson-h">{topic} — the method</div>
      <p className="lesson-core">{l.core}</p>
      <ul className="lesson-list">{l.facts.map((f, i) => <li key={i}>{f}</li>)}</ul>
      <div className="lesson-eg"><b>Worked example</b>{l.example}</div>
      <div className="lesson-trap"><b>What goes wrong</b>{l.traps}</div>

      {deep.length > 0 && (
        <>
          <button className="deeptoggle" aria-expanded={openDeep} onClick={() => setOpenDeep(!openDeep)}>
            {openDeep ? '− Hide the derivations' : `+ Go deeper (${deep.length} notes on why this works)`}
          </button>
          {openDeep && (
            <div className="deepbox">
              {deep.map((d, i) => (
                <div className="deepitem" key={i}>
                  <b>{d.q}</b>
                  <p>{d.a}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {onPractice && (
        <button className="btn" style={{ width: '100%', marginTop: 12 }} onClick={() => onPractice(topic)}>
          Practice {topic.toLowerCase()} now
        </button>
      )}
    </div>
  );
}


/* ============================================================
   EXAM MODE — full timed section simulation.

   Differs from drilling in every way that matters:
     · one clock for the whole section, not per question
     · no feedback until the section ends
     · skip, flag, and navigate freely, as on the real test
     · a review screen before you submit
     · results and a full explanation review afterwards

   This is what builds the stamina and triage judgement that
   drilling cannot. Section structures match the 2026 formats.
   ============================================================ */

const SECTIONS = {
  GRE: [
    { k:'q1', label:'Quantitative — Section 1', section:'Quant',  n:12, min:21 },
    { k:'q2', label:'Quantitative — Section 2', section:'Quant',  n:15, min:26 },
    { k:'v1', label:'Verbal — Section 1',       section:'Verbal', n:12, min:18 },
    { k:'v2', label:'Verbal — Section 2',       section:'Verbal', n:15, min:23 },
  ],
  GMAT: [
    { k:'q',  label:'Quantitative', section:'Quant',         n:21, min:45 },
    { k:'v',  label:'Verbal',       section:'Verbal',        n:23, min:45 },
    { k:'di', label:'Data Insights', section:'Data Insights', n:20, min:45 },
  ],
};

function buildSection(exam, spec, cards) {
  const pool = BANK.filter(q => q.exam === exam && q.section === spec.section);
  // Weight toward unseen and unmastered so a section is not a rerun,
  // but keep a realistic difficulty mix rather than all-hard.
  const rank = q => {
    const c = cards['' + q.id] || cards[q.id];
    if (!c) return 0;
    if (isMastered(c)) return 2;
    return 1;
  };
  const shuffled = shuffle(pool).sort((a, b) => rank(a) - rank(b));
  const want = Math.min(spec.n, pool.length);
  const picked = shuffled.slice(0, want);
  // Present in a realistic spread rather than easiest-first.
  return shuffle(picked);
}

function Exam({ exam, spec, queue, onExit, onFinish }) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [phase, setPhase] = useState('test');       // test · review · results
  const [left, setLeft] = useState(spec.min * 60 * 1000);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [announce, setAnnounce] = useState('');
  const started = useRef(Date.now());
  const warned = useRef({});
  const qHeading = useRef(null);

  useEffect(() => {
    if (phase !== 'test') return;
    const t = setInterval(() => {
      const rem = spec.min * 60 * 1000 - (Date.now() - started.current);
      setLeft(rem);
      // WCAG 2.2.1: a timed section is an "essential" exception, but the
      // user must still be warned. Announce at meaningful thresholds only,
      // never on every tick, or a screen reader is unusable.
      const mins = Math.ceil(rem / 60000);
      [10, 5, 2, 1].forEach(m => {
        if (mins === m && !warned.current[m]) {
          warned.current[m] = true;
          setAnnounce(`${m} minute${m === 1 ? '' : 's'} remaining in this section.`);
        }
      });
      if (rem <= 0) { clearInterval(t); setPhase('results'); }
    }, 250);
    return () => clearInterval(t);
  }, [phase, spec.min]);

  const q = queue[i];
  const answered = queue.filter(x => respComplete(x, answers[x.id])).length;

  // Move focus to the question heading whenever the question changes, so
  // keyboard and screen reader users land on the new content instead of
  // being stranded on the previous Next button.
  useEffect(() => {
    if (phase === 'test' && qHeading.current) qHeading.current.focus();
  }, [i, phase]);
  const lowTime = left < 5 * 60 * 1000;

  const setResp = (v) => setAnswers(a => ({ ...a, [q.id]: v }));

  const submit = () => {
    setPhase('results');
    const ms = Date.now() - started.current;
    const results = queue.map(x => ({
      q: x,
      resp: answers[x.id],
      ok: isCorrect(x, answers[x.id]),
      answered: respComplete(x, answers[x.id]),
    }));
    onFinish(results, ms);
  };

  /* ---------- results ---------- */
  if (phase === 'results') {
    const results = queue.map(x => ({
      q: x, resp: answers[x.id],
      ok: isCorrect(x, answers[x.id]),
      answered: respComplete(x, answers[x.id]),
    }));
    const right = results.filter(r => r.ok).length;
    const blank = results.filter(r => !r.answered).length;
    const pct = Math.round((right / results.length) * 100);
    const used = Math.min(spec.min * 60 * 1000, Date.now() - started.current);
    const rq = results[reviewIdx];

    return (
      <div>
        <h1 className="h1">{spec.label} — complete</h1>
        <div className="card" style={{ marginTop: 14 }}>
          <div className="statrow">
            <div className="stat"><div className="stat-n">{right}/{results.length}</div><div className="stat-l">Correct</div></div>
            <div className="stat"><div className="stat-n">{pct}%</div><div className="stat-l">Accuracy</div></div>
            <div className="stat"><div className="stat-n">{blank}</div><div className="stat-l">Left blank</div></div>
            <div className="stat"><div className="stat-n">{fmtClock(used)}</div><div className="stat-l">Time used</div></div>
          </div>
        </div>

        {blank > 0 && (
          <div className="card pad" style={{ marginTop: 12, borderColor: 'var(--flag)' }}>
            <b>{blank} question{blank === 1 ? '' : 's'} left blank.</b> There is no penalty for a wrong
            answer, so a blank and a wrong guess score the same. Always fill something in before time expires.
          </div>
        )}

        <h2 className="h2" style={{ marginTop: 24 }}>Review every question</h2>
        <div className="revgrid">
          {results.map((r, k) => (
            <button key={r.q.id} className="revbox"
              data-s={!r.answered ? 'blank' : r.ok ? 'ok' : 'bad'}
              aria-label={`Question ${k + 1}: ${!r.answered ? 'not answered' : r.ok ? 'correct' : 'incorrect'}`}
              onClick={() => setReviewIdx(k)}>
              {k + 1}
            </button>
          ))}
        </div>

        {rq && (
          <div className="card" style={{ marginTop: 14 }}>
            <div className="qmeta">
              <span className="tag" data-e={rq.q.exam}>{rq.q.exam}</span>
              <span>{TYPE_NAMES[rq.q.type] || rq.q.type}</span>
              <span className="spacer" />
              <span>Question {reviewIdx + 1}</span>
            </div>
            <div className="pad">
              <Question q={rq.q} resp={rq.resp} setResp={() => {}} revealed={true} />
              <hr className="hr" style={{ margin: '18px 0 14px' }} />
              <div className="verdict" data-v={rq.ok ? 'ok' : 'bad'}>
                <span className="dot" aria-hidden="true" />
                {!rq.answered ? 'Left blank' : rq.ok ? 'Correct' : 'Incorrect'}
              </div>
              <div className="expl">{rq.q.explain.split('\n').map((p, k) => <p key={k}>{p}</p>)}</div>
              <div className="take"><b>Takeaway</b>{rq.q.take}</div>
            </div>
          </div>
        )}

        <div className="foot">
          <button className="btn" onClick={onExit}>Back to overview</button>
        </div>
      </div>
    );
  }

  /* ---------- review screen before submitting ---------- */
  if (phase === 'review') {
    return (
      <div>
        <h1 className="h1">Review before submitting</h1>
        <p className="sub">
          {answered} of {queue.length} answered · {fmtClock(left)} remaining.
          Tap any question to return to it.
        </p>
        <div className="revgrid">
          {queue.map((x, k) => (
            <button key={x.id} className="revbox"
              data-s={respComplete(x, answers[x.id]) ? 'done' : 'blank'}
              data-flag={flags[x.id] ? 1 : 0}
              aria-label={`Question ${k + 1}${respComplete(x, answers[x.id]) ? ', answered' : ', not answered'}${flags[x.id] ? ', flagged' : ''}`}
              onClick={() => { setI(k); setPhase('test'); }}>
              {k + 1}
            </button>
          ))}
        </div>
        <div className="gauge-note" style={{ padding: '10px 2px' }}>
          Filled squares are answered. A corner mark means you flagged it.
        </div>
        <div className="foot">
          <button className="btn" onClick={submit}>Submit section</button>
          <button className="btn ghost" onClick={() => setPhase('test')}>Keep working</button>
        </div>
      </div>
    );
  }

  /* ---------- the test itself ---------- */
  return (
    <div>
      <div className="examtop" data-low={lowTime ? 1 : 0}>
        <span className="examtop-l">
          {spec.label}
          {lowTime && <span className="examtop-warn"> · Low time</span>}
        </span>
        <span className="spacer" />
        <span className="examtop-c">
          <span className="sr-only">Time remaining: </span>
          {fmtClock(left)}
        </span>
      </div>
      <div aria-live="polite" className="sr-only">{announce}</div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="qmeta">
          <h2 className="qhead" tabIndex={-1} ref={qHeading}>
            Question {i + 1} of {queue.length}
          </h2>
          <span className="spacer" />
          <button className="flagbtn" aria-pressed={!!flags[q.id]}
            onClick={() => setFlags(f => ({ ...f, [q.id]: !f[q.id] }))}>
            {flags[q.id] ? '● Flagged' : '○ Flag for review'}
          </button>
        </div>
        <div className="pad">
          <Question q={q} resp={answers[q.id]} setResp={setResp} revealed={false} />
        </div>
      </div>

      <div className="actionbar">
        <div className="actionbar-in">
          <button className="btn ghost" disabled={i === 0} onClick={() => setI(i - 1)}>Back</button>
          {i + 1 < queue.length
            ? <button className="btn grow" onClick={() => setI(i + 1)}>Next</button>
            : <button className="btn grow" onClick={() => setPhase('review')}>Review section</button>}
          <button className="btn ghost" onClick={() => setPhase('review')}>List</button>
        </div>
      </div>
    </div>
  );
}

function ExamPicker({ exam, cards, onStart }) {
  const specs = SECTIONS[exam];
  return (
    <div style={{ marginTop: 22 }}>
      <h2 className="h2">Timed sections</h2>
      <p className="sub" style={{ marginBottom: 14 }}>
        A real section, on the real clock. No feedback until you finish, and you can skip, flag,
        and come back — exactly as on test day. This is what builds pacing judgement; drilling cannot.
      </p>
      <div className="modes">
        {specs.map(sp => {
          const pool = BANK.filter(q => q.exam === exam && q.section === sp.section).length;
          const short = pool < sp.n;
          return (
            <button className="mode" key={sp.k} onClick={() => onStart(sp)}>
              <div className="mode-k">{sp.min} minutes · {Math.min(sp.n, pool)} questions</div>
              <div className="mode-t">{sp.label}</div>
              <div className="mode-d">
                {short
                  ? `Bank holds ${pool} questions for this section, so it will run short of the real ${sp.n}.`
                  : `Matches the real section: ${sp.n} questions in ${sp.min} minutes.`}
                {' '}Once started, the clock runs continuously and submits automatically at zero.
                You will be warned at 10, 5, 2, and 1 minutes.
              </div>
            </button>
          );
        })}
      </div>
      <div className="gauge-note" style={{ padding: '12px 2px 0' }}>
        Sit these without pausing. Stamina and triage are the variables a section tests that a
        ten-question drill does not.
      </div>
    </div>
  );
}

function Learn({ attempts, exam, onPractice }) {
  const [open, setOpen] = useState(null);
  const acc = useMemo(() => {
    const m = {};
    attempts.filter(a => a.exam === exam).forEach(a => {
      m[a.topic] = m[a.topic] || { n: 0, ok: 0 };
      m[a.topic].n++; if (a.correct) m[a.topic].ok++;
    });
    return m;
  }, [attempts, exam]);

  const topics = useMemo(() => {
    const inBank = [...new Set(BANK.filter(q => q.exam === exam).map(q => q.topic))];
    return inBank.filter(t => LESSONS[t]).sort((a, b) => {
      const A = acc[a], B = acc[b];
      const pa = A ? A.ok / A.n : 2, pb = B ? B.ok / B.n : 2;   // untested topics sort last
      return pa - pb || a.localeCompare(b);
    });
  }, [exam, acc]);

  return (
    <div style={{ marginTop: 22 }}>
      <h2 className="h2">Method guides</h2>
      <p className="sub" style={{ marginBottom: 14 }}>
        One guide per topic, ordered by where you are weakest. Read the guide, then run a
        weak-topic set on it — reading alone does not move the needle.
      </p>
      <div className="card">
        {topics.map(t => {
          const a = acc[t];
          const pct = a ? Math.round((a.ok / a.n) * 100) : null;
          return (
            <div key={t}>
              <button className="lessonrow" aria-expanded={open === t} onClick={() => setOpen(open === t ? null : t)}>
                <span className="lessonrow-t">{t}</span>
                <span className="lessonrow-s" data-weak={pct != null && pct < 90 ? 1 : 0}>
                  {pct != null ? `${pct}%` : 'not tested'}
                </span>
                <span className="lessonrow-c">{open === t ? '−' : '+'}</span>
              </button>
              {open === t && <div className="lessonbody"><Lesson topic={t} compact onPractice={onPractice} /></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Drill({ queue, onDone, onRecord, exam }) {
  const [i, setI] = useState(0);
  const [resp, setResp] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [tag, setTag] = useState(null);
  const [lastMs, setLastMs] = useState(0);
  const [showLesson, setShowLesson] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [results, setResults] = useState([]);
  const start = useRef(Date.now());
  const q = queue[i];

  useEffect(() => { start.current = Date.now(); setElapsed(0); }, [i]);
  useEffect(() => {
    if (revealed) return;
    const t = setInterval(() => setElapsed(Date.now() - start.current), 500);
    return () => clearInterval(t);
  }, [revealed, i]);

  const submit = useCallback(() => {
    if (revealed || !respComplete(q, resp)) return;
    const ok = isCorrect(q, resp);
    const ms = Date.now() - start.current;
    setRevealed(true);
    setLastMs(ms);
    setResults(r => [...r, { id: q.id, ok, ms }]);
    if (ok) onRecord({ q, correct: true, ms, tag: null });
  }, [q, resp, revealed, onRecord]);

  const commitWrong = useCallback((tag) => {
    setTag(tag);
    onRecord({ q, correct: false, ms: lastMs, tag });
  }, [q, lastMs, onRecord]);

  const next = useCallback(() => {
    if (i + 1 >= queue.length) { onDone(results); return; }
    setI(i + 1); setResp(null); setRevealed(false); setTag(null); setShowLesson(false);
  }, [i, queue.length, results, onDone]);

  /* Derived values must be declared before any effect that lists them
     as a dependency — dependency arrays evaluate during render. */
  const target = paceFor(q) * 1000;
  const over = elapsed > target;
  const ok = revealed && isCorrect(q, resp);
  const onPace = lastMs <= target * 1.15;
  const blocked = revealed && !ok && !tag;

  useEffect(() => {
    const h = e => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'Enter') { e.preventDefault(); if (revealed) { if (!blocked) next(); } else submit(); return; }
      const n = parseInt(e.key, 10);
      if (!revealed && n >= 1 && n <= 9 && !q.blanks && q.type !== 'NE') {
        const opts = optionsFor(q);
        if (n <= opts.length) {
          if (q.type === 'SE') {
            const cur = Array.isArray(resp) ? resp : [];
            const idx = n - 1;
            if (cur.includes(idx)) setResp(cur.filter(v => v !== idx));
            else if (cur.length < 2) setResp([...cur, idx]);
          } else setResp(n - 1);
        }
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [q, resp, revealed, blocked, submit, next]);

  return (
    <div>
      <div className="card" style={{ marginTop: 18 }}>
        <div className="qmeta">
          <span className="tag" data-e={q.exam}>{q.exam}</span>
          <span>{GLOSSARY[(TYPE_NAMES[q.type] || '').toLowerCase()]
            ? <Term k={(TYPE_NAMES[q.type] || '').toLowerCase()}>{TYPE_NAMES[q.type]}</Term>
            : (TYPE_NAMES[q.type] || q.type)}</span>
          <span className="spacer" />
          <span>{i + 1} / {queue.length}</span>
          <span className="diff" title={`Difficulty ${q.d} of 5`} aria-label={`Difficulty ${q.d} of 5`}>
            {[1, 2, 3, 4, 5].map(n => <i key={n} data-on={n <= q.d ? 1 : 0} />)}
          </span>
          <div className="pacewrap">
            <div className="pace" data-over={over ? 1 : 0} aria-hidden="true">
              <span style={{ width: `${Math.min(100, (elapsed / target) * 100)}%` }} />
            </div>
            <span aria-hidden="true" style={{ color: over ? 'var(--flag)' : undefined }}>
              {fmtClock(elapsed)} / {fmtClock(target)}
            </span>
            <span className="sr-only">Pacing target {Math.round(target/1000)} seconds</span>
          </div>
        </div>

        <div className="pad">
          <Question q={q} resp={resp} setResp={setResp} revealed={revealed} />

          {revealed && (
            <>
              <hr className="hr" style={{ margin: '18px 0 14px' }} />
              <div className="verdict" data-v={ok ? (onPace ? 'ok' : 'slow') : 'bad'} role="status" aria-live="polite">
                <span className="dot" aria-hidden="true" />
                <span aria-hidden="true" className="vsym">{ok ? (onPace ? '\u2713' : '\u25F4') : '\u2715'}</span>
                {ok ? (onPace ? 'Correct' : 'Correct but over pace') : 'Incorrect'}
                <span style={{ color: 'var(--muted)', letterSpacing: '.06em' }}>
                  · {fmtClock(lastMs)} vs {fmtClock(target)} target
                </span>
              </div>

              {ok && !onPace && (
                <div className="pacewarn">
                  You beat the question but not the <Term k="pacing target">pacing target</Term>.
                  Answers this slow do not survive a real section, so this one stays in rotation
                  until you can land it inside the target.
                </div>
              )}

              {!ok && (
                <div className="tagger">
                  <div className="lbl" style={{ marginBottom: 8 }} id={'tagq-' + q.id}>
                    {tag ? 'Logged as' : 'Why did you miss it?'}
                  </div>
                  {tag ? (
                    <div className="tagged">
                      <span className="dot" style={{ color: 'var(--blue)' }} />
                      {ERROR_LABEL[tag]}
                      <button className="linkbtn" onClick={() => setTag(null)}>change</button>
                    </div>
                  ) : (
                    <div className="tagopts">
                      {ERRORS.map(e => (
                        <button key={e.k} className="tagopt" onClick={() => commitWrong(e.k)}>
                          <b>{e.label}</b><span>{e.hint}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="expl">
                {q.explain.split('\n').map((p, k) => <p key={k}>{p}</p>)}
              </div>
              <div className="take"><b>Takeaway</b>{q.take}</div>

              {LESSONS[q.topic] && (
                <div style={{ marginTop: 12 }}>
                  {showLesson || tag === 'concept' ? (
                    <Lesson topic={q.topic} />
                  ) : (
                    <button className="btn ghost" style={{ width: '100%' }}
                      aria-expanded={false} onClick={() => setShowLesson(true)}>
                      Teach me {q.topic.toLowerCase()}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="actionbar">
        <div className="actionbar-in">
          <button className="btn ghost" onClick={() => onDone(results)}>End set</button>
          {!revealed
            ? <button className="btn grow" onClick={submit} disabled={!respComplete(q, resp)}>
                {respComplete(q, resp) ? 'Submit answer' : 'Choose an answer'}
              </button>
            : <button className="btn grow" onClick={next} disabled={blocked}>
                {blocked
                  ? 'Tag the error first'
                  : (i + 1 >= queue.length ? 'Finish set — see results' : `Next question (${i + 2} of ${queue.length})`)}
              </button>}
          <span className="keys"><span className="kbd">1–9</span> select · <span className="kbd">enter</span> {revealed ? 'next' : 'submit'}</span>
        </div>
      </div>
    </div>
  );
}

function Summary({ results, queue, cards, onHome, onAgain }) {
  const right = results.filter(r => r.ok).length;
  const avg = results.length ? results.reduce((s, r) => s + r.ms, 0) / results.length : 0;
  const onPace = results.filter(r => {
    const q = queue.find(x => x.id === r.id);
    return q && r.ok && r.ms <= paceFor(q) * 1000 * 1.15;
  }).length;
  const missed = results.filter(r => !r.ok).map(r => queue.find(q => q.id === r.id)).filter(Boolean);
  const topics = {};
  missed.forEach(q => { topics[q.topic] = (topics[q.topic] || 0) + 1; });
  const worst = Object.entries(topics).sort((a, b) => b[1] - a[1]);
  const clean = right === results.length && onPace === right && results.length > 0;

  return (
    <div>
      <h1 className="h1">Set complete</h1>
      <div className="card" style={{ marginTop: 14 }}>
        <div className="statrow">
          <div className="stat"><div className="stat-n">{right}/{results.length}</div><div className="stat-l">Correct</div></div>
          <div className="stat"><div className="stat-n">{onPace}</div><div className="stat-l">Right &amp; on pace</div></div>
          <div className="stat"><div className="stat-n">{fmtClock(avg)}</div><div className="stat-l">Avg / question</div></div>
          <div className="stat"><div className="stat-n">{fmtClock(results.reduce((s, r) => s + r.ms, 0))}</div><div className="stat-l">Total time</div></div>
        </div>
      </div>

      {clean && (
        <div className="card pad" style={{ marginTop: 12, borderColor: 'var(--ok)', background: 'var(--ok-wash)' }}>
          Clean set — every question correct and inside the pacing target. All of them advanced a box.
        </div>
      )}

      {right > onPace && (
        <div className="card pad" style={{ marginTop: 12 }}>
          <b>{right - onPace} correct {right - onPace === 1 ? 'answer' : 'answers'} ran over pace.</b> Those did not
          advance in the schedule and will come back tomorrow. At a perfect-score target, speed on a
          question you already know is the cheapest improvement available.
        </div>
      )}

      {worst.length > 0 && (
        <>
          <h2 className="h2" style={{ marginTop: 24 }}>Missed topics</h2>
          <div className="card bars">
            {worst.map(([t, n]) => (
              <div className="bar-row" key={t}>
                <span>{t}</span>
                <div className="bar" data-weak="1"><span style={{ width: `${Math.min(100, n * 34)}%` }} /></div>
                <span className="bar-n">{n} missed</span>
              </div>
            ))}
          </div>
          <div className="gauge-note" style={{ padding: '9px 2px' }}>
            Each of these reset to box zero and returns in your next set.
          </div>
        </>
      )}

      <div className="foot">
        <button className="btn" onClick={onAgain}>Another set</button>
        <button className="btn ghost" onClick={onHome}>Back to overview</button>
      </div>
    </div>
  );
}

function Progress({ attempts, cards, exam }) {
  const pool = useMemo(() => BANK.filter(q => q.exam === exam), [exam]);

  const byTopic = useMemo(() => {
    const m = {};
    attempts.filter(a => a.exam === exam).forEach(a => {
      m[a.topic] = m[a.topic] || { n: 0, ok: 0 };
      m[a.topic].n++; if (a.correct) m[a.topic].ok++;
    });
    return Object.entries(m).map(([t, v]) => ({ t, ...v, pct: v.ok / v.n })).sort((a, b) => a.pct - b.pct);
  }, [attempts, exam]);

  const errCounts = useMemo(() => {
    const m = {};
    pool.forEach(q => {
      const c = cards[q.id];
      if (!c) return;
      Object.entries(c.errs || {}).forEach(([k, n]) => { m[k] = (m[k] || 0) + n; });
    });
    return ERRORS.map(e => ({ ...e, n: m[e.k] || 0 })).filter(e => e.n > 0).sort((a, b) => b.n - a.n);
  }, [pool, cards]);

  const mine = attempts.filter(a => a.exam === exam);
  if (!mine.length) return <div className="card empty">No attempts yet for {exam}. Run a set and your diagnostics will appear here.</div>;

  const right = mine.filter(a => a.correct).length;
  const avg = mine.reduce((s, a) => s + a.ms, 0) / mine.length;
  const days = new Set(mine.map(a => new Date(a.ts).toDateString())).size;
  const mastered = pool.filter(q => isMastered(cards[q.id])).length;
  const totalErr = errCounts.reduce((s, e) => s + e.n, 0);

  return (
    <div>
      <div className="card" style={{ marginTop: 14 }}>
        <div className="statrow">
          <div className="stat"><div className="stat-n">{mine.length}</div><div className="stat-l">Answered</div></div>
          <div className="stat"><div className="stat-n">{Math.round((right / mine.length) * 100)}%</div><div className="stat-l">Accuracy</div></div>
          <div className="stat"><div className="stat-n">{mastered}</div><div className="stat-l">Mastered</div></div>
          <div className="stat"><div className="stat-n">{days}</div><div className="stat-l">Days practiced</div></div>
        </div>
      </div>

      {errCounts.length > 0 && (
        <>
          <h2 className="h2" style={{ marginTop: 26 }}>Why you miss questions</h2>
          <p className="sub" style={{ marginBottom: 12 }}>
            Built from your own <Term k="error tag">error tags</Term>. Careless slips need process
            changes; concept gaps need the method guides.
          </p>
          <div className="card bars">
            {errCounts.map(e => (
              <div className="bar-row" key={e.k}>
                <span>{e.label}</span>
                <div className="bar" data-weak={e.k === 'careless' || e.k === 'misread' ? 1 : 0}>
                  <span style={{ width: `${(e.n / totalErr) * 100}%` }} />
                </div>
                <span className="bar-n">{e.n}</span>
              </div>
            ))}
          </div>
          <div className="gauge-note" style={{ padding: '9px 2px' }}>
            Careless slips and misreads are marked red because they are the errors that keep a strong
            scorer off a perfect one. They respond to process changes, not more studying.
          </div>
        </>
      )}

      <h2 className="h2" style={{ marginTop: 26 }}>Accuracy by topic</h2>
      <div className="card bars">
        {byTopic.map(r => (
          <div className="bar-row" key={r.t}>
            <span>{r.t}</span>
            <div className="bar" data-weak={r.pct < 0.9 ? 1 : 0} aria-hidden="true"><span style={{ width: `${r.pct * 100}%` }} /></div>
            <span className="bar-n">{r.ok}/{r.n}{r.pct < 0.9 && <span className="sr-only"> — below the 90 percent target</span>}</span>
          </div>
        ))}
      </div>
      <div className="gauge-note" style={{ padding: '9px 2px' }}>
        The threshold here is 90%, not 60%. At a perfect-score target, anything you miss one time in ten
        is a topic that will eventually cost you the section.
      </div>
    </div>
  );
}

function Readiness({ exam, cards, attempts, onDrill }) {
  const pool = BANK.filter(q => q.exam === exam);
  const hard = pool.filter(q => q.d >= 4);
  const hardMastered = hard.filter(q => isMastered(cards[q.id])).length;
  const dueNow = pool.filter(q => isDue(cards[q.id])).length;
  const untouched = pool.filter(q => !cards[q.id]).length;

  const slowPool = pool.filter(q => { const c = cards[q.id]; return c && c.slow > 0 && !isMastered(c); }).length;
  const carelessPool = pool.filter(q => {
    const c = cards[q.id];
    return c && ((c.errs?.careless || 0) + (c.errs?.misread || 0)) > 0 && !isMastered(c);
  }).length;

  const mine = attempts.filter(a => a.exam === exam);
  const corrects = mine.filter(a => a.correct);
  const slowRate = corrects.length ? corrects.filter(a => a.ms > a.target * 1.15).length / corrects.length : 0;

  const topics = {};
  mine.forEach(a => { topics[a.topic] = topics[a.topic] || { n: 0, ok: 0 }; topics[a.topic].n++; if (a.correct) topics[a.topic].ok++; });
  const shakyTopics = Object.entries(topics).filter(([, v]) => v.n >= 3 && v.ok / v.n < 0.9).length;

  const blockers = [
    { k:'ceiling',  n: hard.length - hardMastered, label:`hard questions not yet mastered`, sub:`${hardMastered} of ${hard.length} at difficulty 4–5`, drill:'ceiling' },
    { k:'due',      n: dueNow,        label:'questions due for review today', sub:'the schedule decides when these return', drill:'due' },
    { k:'careless', n: carelessPool,  label:'questions missed by slipping, not by not knowing', sub:'the cheapest points on the test', drill:'careless' },
    { k:'slow',     n: slowPool,      label:'questions you get right but too slowly', sub:`${Math.round(slowRate * 100)}% of your correct answers run over pace`, drill:'slow' },
    { k:'topics',   n: shakyTopics,   label:'topics still under 90% accuracy', sub:'the perfect-score threshold', drill:'weak' },
    { k:'unseen',   n: untouched,     label:'questions never attempted', sub:'unknown territory counts against readiness', drill:'unseen' },
  ];

  const open = blockers.filter(b => b.n > 0);
  const ready = open.length === 0 && mine.length > 0;

  return (
    <div>
      <h2 className="h2" style={{ marginTop: 26 }}>Gap to a perfect score</h2>
      <p className="sub" style={{ marginBottom: 12 }}>
        Your actual blockers, in priority order. Tap a row to drill exactly that.
        A question counts as <Term k="mastered">mastered</Term> only after four clean, on-pace repetitions.
      </p>
      {ready ? (
        <div className="card pad" style={{ borderColor: 'var(--ok)', background: 'var(--ok-wash)' }}>
          <b>Nothing outstanding in this bank.</b> Every question is mastered at pace and no topic sits
          below 90%. Move to full-length official practice tests — the remaining variable is stamina, not content.
        </div>
      ) : (
        <div className="card blockers">
          {open.map(b => (
            <button className="blocker" key={b.k} onClick={() => onDrill(b.drill)}>
              <span className="blocker-n">{b.n}</span>
              <span className="blocker-txt">
                <b>{b.label}</b>
                <span>{b.sub}</span>
              </span>
              <span className="blocker-go">Drill →</span>
            </button>
          ))}
        </div>
      )}
      {mine.length === 0 && (
        <div className="gauge-note" style={{ padding: '9px 2px' }}>
          These counts sharpen once you have answered a set or two.
        </div>
      )}
    </div>
  );
}

class Boundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div className="cal">
        <style>{CSS}</style>
        <div className="wrap plain">
          <h1 className="h1">Something broke</h1>
          <div className="card pad">
            <p style={{ marginTop: 0 }}>
              The app hit an error and stopped rendering. Your saved progress is untouched — reloading
              the artifact should bring it back.
            </p>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', wordBreak: 'break-word' }}>
              {String(this.state.err && this.state.err.message || this.state.err)}
            </p>
            <button className="btn" onClick={() => this.setState({ err: null })}>Try again</button>
          </div>
        </div>
      </div>
    );
  }
}

export default function App() {
  return <Boundary><Calibrate /></Boundary>;
}

function Calibrate() {
  const [state, setState] = useState(null);
  const [screen, setScreen] = useState('home');
  const [tab, setTab] = useState('practice');
  const [queue, setQueue] = useState([]);
  const [results, setResults] = useState([]);
  const [lastMode, setLastMode] = useState(null);
  const [len, setLen] = useState(10);
  const [confirmReset, setConfirmReset] = useState(false);
  const [saveOk, setSaveOk] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [examSpec, setExamSpec] = useState(null);
  const [examQ, setExamQ] = useState([]);

  useEffect(() => {
    store.listeners.add(setSaveOk);
    loadState().then(st => { setState(st); if (!st.seenGuide) setShowGuide(true); });
    const onHide = () => { if (document.visibilityState === 'hidden') flushSoon(); };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', flushSoon);
    return () => {
      store.listeners.delete(setSaveOk);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', flushSoon);
      flushSoon();
    };
  }, []);
  useEffect(() => { if (state) saveState(state); }, [state]);

  const exam = state?.exam || 'GRE';
  const attempts = state?.attempts || [];
  const cards = state?.cards || {};
  const challenge = state?.challenge || 'hard';

  const rateCard = useCallback((c, quality) => {
    const key = 'fc:' + c.id;
    setState(s => {
      const prev = s.cards[key] || newCard();
      const nc = { ...newCard(), ...prev, errs: { ...(prev.errs || {}) } };
      const now = Date.now();
      if (quality === 'again') { nc.b = 0; nc.s = 0; nc.l += 1; nc.due = now; }
      else if (quality === 'hard') { nc.b = Math.max(1, nc.b); nc.s += 1; nc.due = now + DAY; }
      else { nc.b = Math.min(5, nc.b + 1); nc.s += 1; nc.due = now + BOX_DAYS[nc.b] * DAY; }
      nc.seen = (nc.seen || 0) + 1; nc.lastAt = now;
      return { ...s, cards: { ...s.cards, [key]: nc } };
    });
  }, []);

  const record = useCallback(({ q, correct, ms, tag }) => {
    const target = paceFor(q) * 1000;
    setState(s => ({
      ...s,
      attempts: [...s.attempts, {
        id:q.id, d:q.d, exam:q.exam, section:q.section, topic:q.topic,
        correct, ms, target, tag, ts: Date.now(),
      }].slice(-1200),
      cards: { ...s.cards, [q.id]: updateCard(s.cards[q.id], { correct, ms, target, tag }) },
    }));
  }, []);

  const topicAcc = useMemo(() => {
    const m = {};
    attempts.forEach(a => { m[a.topic] = m[a.topic] || { n: 0, ok: 0 }; m[a.topic].n++; if (a.correct) m[a.topic].ok++; });
    return m;
  }, [attempts]);

  /* ---- adaptive queue builder ---- */
  const build = (mode) => {
    const all = BANK.filter(q => q.exam === exam);
    const card = q => cards[q.id];
    let pool = all;

    if (mode === 'quant') pool = all.filter(q => q.section === 'Quant');
    if (mode === 'verbal') pool = all.filter(q => q.section !== 'Quant');
    if (mode === 'ceiling') pool = all.filter(q => q.d >= 4 && !isMastered(card(q)));
    if (mode === 'due') pool = all.filter(q => isDue(card(q)));
    if (mode === 'unseen') pool = all.filter(q => !card(q));
    if (mode === 'slow') pool = all.filter(q => { const c = card(q); return c && c.slow > 0 && !isMastered(c); });
    if (mode === 'careless') pool = all.filter(q => {
      const c = card(q);
      return c && ((c.errs?.careless || 0) + (c.errs?.misread || 0)) > 0 && !isMastered(c);
    });
    if (mode.startsWith('topic:')) {
      const t = mode.slice(6);
      pool = all.filter(q => q.topic === t);
    }
    if (mode === 'weak') {
      const weak = Object.entries(topicAcc).filter(([, v]) => v.n >= 3 && v.ok / v.n < 0.9).map(([t]) => t);
      pool = weak.length ? all.filter(q => weak.includes(q.topic)) : all;
    }

    // graceful fallback so a mode is never empty and never dead-ends
    if (!pool.length) pool = all.filter(q => !isMastered(card(q)));
    if (!pool.length) pool = all;

    /* priority: overdue reviews > lapsed > never seen > slow > everything else. */
    const rank = q => {
      const c = card(q);
      if (!c) return 2;
      if (isMastered(c)) return 5;
      if (c.due <= Date.now()) return c.l > 0 ? 0 : 1;
      if (c.slow > 0) return 3;
      return 4;
    };

    /* Difficulty targeting is driven by the challenge level you pick, not
       by a cap the app imposes. 'adaptive' tracks measured ability; the
       fixed levels ignore it entirely and serve what you asked for. */
    const targetD = (() => {
      if (mode === 'ceiling') return 5;
      if (challenge === 'brutal') return 5;
      if (challenge === 'hard') return 4;
      if (challenge === 'ramp') return 2;
      const rel = attempts.filter(a => a.exam === exam &&
        (mode === 'quant' ? a.section === 'Quant' : mode === 'verbal' ? a.section !== 'Quant' : true));
      if (rel.length < 5) return 3;
      const est = estimate(rel.map(a => ({ d: a.d, correct: a.correct })));
      if (!est) return 3;
      return Math.max(2, Math.min(5, Math.round(est.theta + 0.5)));
    })();

    const scored = shuffle(pool).map(q => ({ q, r: rank(q), d: q.d }));

    if (mode === 'ceiling' || challenge === 'brutal') {
      const top = scored.filter(s => s.d >= (challenge === 'brutal' ? 5 : 4));
      const use = top.length >= len ? top : scored.filter(s => s.d >= 4);
      use.sort((a, b) => (a.r - b.r) || (b.d - a.d));
      return use.slice(0, len).map(x => x.q);
    }

    /* Spread around the target so a set is not ten identical-difficulty
       questions. 'hard' skews the spread upward rather than downward. */
    const offsets = challenge === 'hard'
      ? [0, 0, 0, 0, 0, 1, 1, 1, -1, 1]
      : [-1, 0, 0, 0, 0, 0, 1, 1, 0, 1];
    const wants = [];
    for (let i = 0; i < len; i++) {
      wants.push(Math.max(1, Math.min(5, targetD + offsets[i % offsets.length])));
    }

    scored.sort((a, b) => a.r - b.r);
    const picked = [];
    const used = new Set();
    for (const want of wants) {
      let best = null, bestScore = Infinity;
      for (const s of scored) {
        if (used.has(s.q.id)) continue;
        const sc = s.r * 10 + Math.abs(s.d - want);
        if (sc < bestScore) { bestScore = sc; best = s; }
      }
      if (!best) break;
      used.add(best.q.id); picked.push(best.q);
    }
    return shuffle(picked);
  };

  const start = (mode) => {
    const q = build(mode);
    if (!q.length) return;
    setQueue(q); setResults([]); setLastMode(mode); setScreen('drill');
  };

  const rec = k => attempts.filter(a => a.exam === 'GRE' && a.section === k).map(a => ({ d: a.d, correct: a.correct }));
  const greQ = rec('Quant'), greV = rec('Verbal');
  const gmat = attempts.filter(a => a.exam === 'GMAT').map(a => ({ d: a.d, correct: a.correct }));

  const pool = BANK.filter(q => q.exam === exam);
  const dueCount = pool.filter(q => isDue(cards[q.id])).length;
  const masteredCount = pool.filter(q => isMastered(cards[q.id])).length;

  const counts = {
    due: dueCount,
    ceiling: pool.filter(q => q.d >= 4 && !isMastered(cards[q.id])).length,
    careless: pool.filter(q => { const c = cards[q.id]; return c && ((c.errs?.careless || 0) + (c.errs?.misread || 0)) > 0 && !isMastered(c); }).length,
    slow: pool.filter(q => { const c = cards[q.id]; return c && c.slow > 0 && !isMastered(c); }).length,
    unseen: pool.filter(q => !cards[q.id]).length,
  };

  if (!state) return <div className="cal"><style>{CSS}</style><div className="wrap plain"><div className="empty">Loading your progress…</div></div></div>;

  const goDrill = m => { setTab('practice'); start(m); };

  return (
    <div className="cal">
      <style>{CSS}</style>

      <a className="skip" href="#main">Skip to main content</a>
      {showGuide && (
        <Guide first={!state.seenGuide}
          onClose={() => { setShowGuide(false); setState(st => ({ ...st, seenGuide: true })); }} />
      )}
      <div className="rail">
        <div className="rail-in">
          <span className="mark">Calibrate</span>
          <span className="spacer" />
          <button className="helpbtn" onClick={() => setShowGuide(true)}
            aria-label="How this app works">?</button>
          <span className="tag" data-e={exam}>{exam}</span>
          <span>{masteredCount}/{pool.length} mastered</span>
          {dueCount > 0 && <span className="pill">{dueCount} due</span>}
        </div>
      </div>

      <main id="main" className={'wrap' + ((screen === 'drill' || screen === 'exam') ? '' : ' plain')}>
        {saveOk === false && (
          <div className="warnbar">
            <b>Progress isn't saving right now.</b> The app still works and this session is kept in memory,
            but it won't survive a reload. Reopening the artifact usually restores it.
          </div>
        )}
        {screen === 'exam' && examSpec && (
          <Exam exam={exam} spec={examSpec} queue={examQ}
            onExit={() => { setScreen('home'); setExamSpec(null); }}
            onFinish={(results, ms) => {
              // fold every exam answer into the same scheduler
              results.forEach(r => {
                if (!r.answered) return;
                record({ q: r.q, correct: r.ok, ms: Math.round(ms / results.length), tag: r.ok ? null : 'time' });
              });
              flushSoon();
            }} />
        )}

        {screen === 'drill' && (
          <Drill queue={queue} exam={exam} onRecord={record}
            onDone={r => { setResults(r); setScreen('summary'); flushSoon(); }} />
        )}

        {screen === 'summary' && (
          <Summary results={results} queue={queue} cards={cards}
            onHome={() => setScreen('home')} onAgain={() => start(lastMode)} />
        )}

        {screen === 'home' && (
          <>
            <h1 className="h1">Where you stand</h1>
            <p className="sub">
              Every answer updates the <Term k="calibration">score estimate</Term> below and reschedules
              the question. The shaded bar is a <Term k="confidence interval">confidence interval</Term>,
              not a score — it narrows as the app learns how you handle the hardest material.
            </p>

            <div className="card">
              {exam === 'GRE' ? (
                <>
                  <Gauge scaleKey="GRE:Quant" records={greQ} />
                  <Gauge scaleKey="GRE:Verbal" records={greV} />
                </>
              ) : (
                <Gauge scaleKey="GMAT:total" records={gmat} />
              )}
            </div>

            <div className="nav" role="tablist" aria-label="Sections">
              {[['practice','Practice'],['test','Test'],['cards','Cards'],['learn','Learn'],['progress','Diagnostics'],['format','Format'],['plan','Plan']].map(([k,l]) => (
                <button key={k} role="tab" id={'tab-'+k} aria-selected={tab === k}
                  aria-controls={'panel-'+k} data-on={tab === k ? 1 : 0}
                  onClick={() => setTab(k)}>{l}</button>
              ))}
            </div>

            {tab === 'practice' && (
              <div role="tabpanel" id="panel-practice" aria-labelledby="tab-practice">
                <Readiness exam={exam} cards={cards} attempts={attempts} onDrill={goDrill} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '26px 0 14px', flexWrap: 'wrap' }}>
                  <h2 className="h2" style={{ margin: 0 }}>Start a set</h2>
                  <span className="spacer" />
                  <div className="seg">
                    <button data-on={exam === 'GRE' ? 1 : 0} onClick={() => setState(s => ({ ...s, exam: 'GRE' }))}>GRE</button>
                    <button data-on={exam === 'GMAT' ? 1 : 0} onClick={() => setState(s => ({ ...s, exam: 'GMAT' }))}>GMAT</button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span className="lbl"><Term k="challenge level">Challenge</Term></span>
                  <div className="seg">
                    {[['ramp','Ramp'],['adaptive','Adaptive'],['hard','Hard'],['brutal','Brutal']].map(([k,l]) => (
                      <button key={k} data-on={challenge === k ? 1 : 0} aria-pressed={challenge === k}
                        onClick={() => setState(s => ({ ...s, challenge: k }))}>{l}</button>
                    ))}
                  </div>
                </div>
                <div className="gauge-note" style={{ marginBottom: 16 }}>
                  {CHALLENGE_NOTE[challenge]}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                  <span className="lbl">Set length</span>
                  <div className="seg">
                    {[5, 10, 20, 40].map(n => (
                      <button key={n} data-on={len === n ? 1 : 0} aria-pressed={len === n}
                        aria-label={n + ' questions per set'} onClick={() => setLen(n)}>{n}</button>
                    ))}
                  </div>
                </div>

                <div className="modes">
                  {['mixed', 'due', 'ceiling', 'careless', 'slow', 'weak', 'quant', 'verbal', 'unseen'].map(m => {
                    const n = counts[m];
                    const disabled = n === 0;
                    return (
                      <button className="mode" key={m} disabled={disabled} onClick={() => start(m)}>
                        <div className="mode-k">{n != null ? `${n} available` : `${len} questions`}</div>
                        <div className="mode-t">{MODES[m].t}</div>
                        <div className="mode-d">{MODES[m].d || (m === 'quant'
                          ? (exam === 'GRE'
                              ? 'Comparison, problem solving, numeric entry, data interpretation.'
                              : 'Problem solving only — geometry and data sufficiency are no longer in GMAT Quant.')
                          : (exam === 'GRE'
                              ? 'Text completion, sentence equivalence, reading comprehension.'
                              : 'Critical reasoning, plus data sufficiency and data insights.'))}</div>
                      </button>
                    );
                  })}
                  {confirmReset ? (
                    <div className="mode" style={{ borderColor: 'var(--flag)', background: 'var(--flag-wash)' }}>
                      <div className="mode-k" style={{ color: 'var(--flag)' }}>Confirm</div>
                      <div className="mode-t">Erase everything?</div>
                      <div className="mode-d" style={{ marginBottom: 10 }}>
                        Clears every attempt, card, and review date. This cannot be undone.
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn" style={{ background: 'var(--flag)', borderColor: 'var(--flag)' }}
                          onClick={() => { setState(blank()); setConfirmReset(false); }}>Erase</button>
                        <button className="btn ghost" onClick={() => setConfirmReset(false)}>Keep it</button>
                      </div>
                    </div>
                  ) : (
                    <button className="mode" onClick={() => setConfirmReset(true)}>
                      <div className="mode-k">Careful</div>
                      <div className="mode-t">Reset everything</div>
                      <div className="mode-d">Clears all attempts and returns every question to unseen.</div>
                    </button>
                  )}
                </div>
              </div>
            )}

            {tab === 'test' && (
              <div role="tabpanel" id="panel-test" aria-labelledby="tab-test">
                <ExamPicker exam={exam} cards={cards} onStart={sp => {
                  const qs = buildSection(exam, sp, cards);
                  if (!qs.length) return;
                  setExamSpec(sp); setExamQ(qs); setScreen('exam');
                }} />
              </div>
            )}

            {tab === 'cards' && <div role="tabpanel" id="panel-cards" aria-labelledby="tab-cards"><Flash cards={cards} onRate={rateCard} exam={exam} /></div>}

            {tab === 'learn' && <div role="tabpanel" id="panel-learn" aria-labelledby="tab-learn"><Learn attempts={attempts} exam={exam} onPractice={t => goDrill('topic:' + t)} /></div>}

            {tab === 'progress' && <div role="tabpanel" id="panel-progress" aria-labelledby="tab-progress"><Progress attempts={attempts} cards={cards} exam={exam} /></div>}

            {tab === 'format' && <div role="tabpanel" id="panel-format" aria-labelledby="tab-format"><Format exam={exam} /></div>}

            {tab === 'plan' && (
              <div role="tabpanel" id="panel-plan" aria-labelledby="tab-plan" style={{ marginTop: 22 }}>
                <h2 className="h2">Aiming at a perfect score</h2>
                <div className="card pad" style={{ fontSize: 15, lineHeight: 1.65 }}>
                  <p style={{ marginTop: 0 }}>
                    <b>The target is 170 on both sections.</b> A perfect quant score is attainable for a
                    strong engineer and is the number Penn and Georgia Tech actually weigh. A perfect verbal
                    score is a different kind of climb — it is decided less by raw ability than by vocabulary
                    coverage and reading discipline — but it yields to the same machinery: the card decks
                    schedule vocabulary until recall is automatic, and the error tags show whether verbal
                    misses come from unknown words, misreading, or pace. Both sections get the same standard
                    here: hard-band mastery, on pace, at 90-plus percent accuracy.
                  </p>
                  <p>
                    <b>At this level, accuracy is not the metric — consistency is.</b> Missing one quant question
                    typically costs the perfect score outright. That means a topic at 90% is a problem, and this
                    app flags it as one. Mastery here requires four clean, on-pace repetitions spread across
                    growing intervals, not a single correct answer.
                  </p>
                  <p>
                    <b>Diagnose every miss.</b> Careless slips and misreads have completely different fixes from
                    concept gaps: they respond to process changes — writing the question's actual demand
                    before solving, re-reading the final line, checking units — not to more practice. The app
                    makes you tag each miss for exactly this reason, and the Diagnostics tab shows which
                    category is really costing you.
                  </p>
                  <p>
                    <b>Right-but-slow is a failing answer.</b> Questions answered correctly over the pacing target
                    do not advance in the schedule. Under real section timing that accuracy evaporates, so the
                    app keeps returning them until the speed is there.
                  </p>
                  <p style={{ marginBottom: 0 }}>
                    <b>Built to the current format.</b> Every question is original and written to the
                    specifications in force now: the shortened GRE introduced in September 2023, and the
                    GMAT Focus Edition. That means no GMAT geometry, no sentence correction, and data
                    sufficiency counted under Data Insights rather than Quant. Pacing targets come from the
                    real section timings. See the Format tab for the full structure.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
