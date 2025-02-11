# @automattic/site-admin

`@automattic/site-admin` is a reusable UI package designed to provide the necessary resources for implementing a modern administrative interface within the WordPress admin. It offers structured components, a routing system, and layout utilities inspired by the Site Editor while maintaining flexibility and independence from Core.

This package prioritizes consistency with wp-admin, ensuring a seamless and scalable admin experience with minimal external dependencies.

## Installation

```cli
npm install @automattic/site-admin
```

or

```
yarn add @automattic/site-admin
```

## Designed for Versatility

While primarily built for WordPress-based projects, this package is designed to be flexible enough to support other administrative applications.

By providing a self-contained framework, @automattic/site-admin enables the development of custom dashboards and interfaces, even in environments that do not rely on traditional WordPress plugin architecture.

## Scope and Development Principles

### Independence from Gutenberg Core

This package is a standalone solution without strict alignment to Gutenberg Core’s source code. While some components may be adapted for efficiency, the goal is not to fork or replicate Core but to provide a well-structured and optimized implementation that meets specific admin UI needs.

That said, we recognize the value of aligning with Core’s guidelines. Ensuring compatibility with Gutenberg-friendly technologies and coding standards improves maintainability and keeps the door open for potential future contributions to WordPress Core.

While this package is currently developed independently, we acknowledge that some of its implementations—or even the entire package—could eventually be moved upstream to Core if it benefits the broader WordPress ecosystem.

Finally, even if this migration never happens, adhering to Core’s best practices remains a strategic choice that enhances productivity and long-term integration possibilities.

### Consistency in Design and Behavior

Maintaining visual and functional consistency with the WordPress admin experience is a priority.
The package should be a reliable foundation for administrative applications, ensuring a familiar and cohesive experience across different projects.

### Minimal External Dependencies

  * Relies solely on WordPress dependencies whenever possible.
  * Avoids integrating with external frameworks unless strictly necessary due to Core limitations.
  * While included in this Calypso monorepo for hosting and centralization, it is not tightly coupled with its libraries.
