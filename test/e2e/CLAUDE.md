# E2E Test Framework Instructions

## Documentation

Full documentation is available in:
- `docs/` - Legacy framework documentation
- `docs-new/` - New Playwright Test framework documentation

Key docs to reference:
- [Overview](docs-new/overview.md)
- [Setup](docs-new/setup.md)
- [Running and Debugging Tests](docs-new/running_debugging_tests.md)
- [Creating Reliable Tests](docs-new/creating_reliable_tests.md)
- [New Style Guide](docs-new/new_style_guide.md)
- [Custom Fixtures](docs-new/custom_fixtures.md)

## Framework Migration Status

We are migrating from the legacy framework to Playwright Test:

**Legacy Framework (Playwright + Jest runner)**
- Test files: `specs/**/*.ts` (without `.spec.` in filename)
- Examples: `specs/blocks/blocks__core.ts`, `specs/published-content/likes__post.ts`
- Documentation: `docs/`
- Status: Being phased out, do not write new tests in this format

**New Framework (Playwright Test)**
- Test files: `specs/**/*.spec.ts` (with `.spec.` in filename)
- Examples: `specs/tools/import__sites-squarespace.spec.ts`, `specs/tools/marketing__seo.spec.ts`
- Documentation: `docs-new/`
- Status: Target framework for all new and migrated tests

## Guidelines

- Always write new tests using Playwright Test (`.spec.ts` files)
- When modifying existing tests, consider migrating them to the new framework
- Follow the patterns and style guide in `docs-new/`
- Reference legacy docs only for understanding existing code

## Running Tests

When running Playwright Test specs (`.spec.ts` files):

**IMPORTANT**: Always use `--reporter=list` to prevent the HTML report from opening automatically on failure. Without this flag, the test process will hang waiting for the HTML report browser window to close.

```bash
# Good - process exits immediately after test completion
yarn playwright test specs/path/to/test.spec.ts --reporter=list

# Bad - hangs on failure waiting for HTML report to close
yarn playwright test specs/path/to/test.spec.ts
```

For legacy tests (`*.ts` without `.spec.`), use the Jest runner:
```bash
yarn test specs/path/to/test.ts
```
