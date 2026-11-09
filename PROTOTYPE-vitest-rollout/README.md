# Vitest rollout and drift-check scratch files

Throwaway prototype code. Never merge this branch.

- `codemod2.mjs`: the Dashboard Jest-to-Vitest codemod extended for `client/` and packages (DOTMSD-1673). Run it as `node PROTOTYPE-vitest-rollout/codemod2.mjs full <files…>`.
- `configs/`: the working Vitest configs and setup files from that survey. The client setup PR starts from `vitest-setup.ts`, which holds the `jest` shim. `SLICE` is a file listing the tests to run.
- `drift/collapse-check.mjs`: detects packages the Vite dep optimizer collapses to one install (DOTMSD-1687).

Vite and Vitest aren't installed on this branch. Copy `drift/` onto `try/vite-section-css` to run the collapse check, because it imports that branch's `build-tools/vite/dev.mjs`. Copy `configs/` onto `try/vite-shared-config` to run the Vitest configs.

The plan that uses these files is on DOTMSD-1693.
