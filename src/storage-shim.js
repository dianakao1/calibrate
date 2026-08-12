/**
 * Storage shim.
 *
 * Inside Claude, the app talks to `window.storage`, a key/value API the
 * artifact runtime provides. That object does not exist on the open web,
 * so this shim recreates the same interface on top of localStorage.
 *
 * The behaviour is matched deliberately, including one quirk the app
 * relies on: `get` on a missing key THROWS rather than returning null.
 * The app's loadState() catches that and treats it as a first run.
 *
 * Import this once, before the app mounts.
 */

const PREFIX = 'calibrate:';

function available() {
  try {
    const k = '__probe__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    // Private browsing, disabled storage, or a sandboxed iframe.
    return false;
  }
}

// In-memory fallback so the app still runs when localStorage is blocked.
const memory = new Map();
const canUse = available();

const backend = canUse
  ? {
      get: (k) => localStorage.getItem(k),
      set: (k, v) => localStorage.setItem(k, v),
      del: (k) => localStorage.removeItem(k),
      keys: () => Object.keys(localStorage),
    }
  : {
      get: (k) => (memory.has(k) ? memory.get(k) : null),
      set: (k, v) => memory.set(k, v),
      del: (k) => memory.delete(k),
      keys: () => [...memory.keys()],
    };

if (typeof window !== 'undefined' && !window.storage) {
  window.storage = {
    async get(key) {
      const value = backend.get(key);
      if (value === null || value === undefined) {
        throw new Error(`Key not found: ${key}`);
      }
      return { key, value, shared: false };
    },

    async set(key, value) {
      try {
        backend.set(key, value);
      } catch (e) {
        // Most likely the ~5MB quota. Surface it so the app's retry
        // logic can back off and show its "not saving" banner.
        throw new Error(`Storage write failed: ${e.message}`);
      }
      return { key, value, shared: false };
    },

    async delete(key) {
      backend.del(key);
      return { key, deleted: true, shared: false };
    },

    async list(prefix = PREFIX) {
      const keys = backend.keys().filter((k) => k.startsWith(prefix));
      return { keys, prefix, shared: false };
    },
  };

  if (!canUse) {
    console.warn(
      'Calibrate: localStorage is unavailable, so progress will not survive a reload. ' +
        'This usually means private browsing or blocked site data.'
    );
  }
}
