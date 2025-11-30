---
applyTo: "client/dashboard/**"
---

## Styling & Components (Dashboard)

### Use Base WordPress components instead of custom CSS

When working in `client/dashboard`, **avoid adding new custom CSS files or ad‑hoc CSS** unless absolutely necessary.

Our styling should come from **Base WordPress components and their props** (e.g. `className`, variant/size props, layout props, etc.), not from new CSS rules.

**Preferred approaches:**
- Use existing Base components (buttons, cards, layout, typography, etc.) and configure them via their documented props.
- Reuse existing design tokens, utility classes, and patterns already provided by the component library.
- If a new visual pattern is needed, first:
  - Check whether an existing Base component can be adapted.
  - If not, propose an addition/change to the shared component library rather than adding local CSS.

**If you believe custom styling is unavoidable:**
1. Explain in the PR description why Base components/props are insufficient.
2. Keep the customization as small and localized as possible.
3. Prefer extending existing shared styles/components over introducing a new CSS file.
4. Flag the PR for review by someone familiar with our WordPress Base components/design system.

**Reviewers:**  
For changes under `client/dashboard`:
- Push back on new `*.css` files or large blocks of custom styles.
- Ask whether the same result can be achieved by:
  - Choosing a more appropriate Base component, or
  - Using existing props/variants/tokens.  
- Only accept custom CSS if the limitation is clear and documented.