# @automattic/site-admin

`@automattic/site-admin` is a reusable UI package designed to streamline the creation of modern administrative interfaces within the WordPress admin. It provides structured components, a routing system, and layout utilities inspired by the Site Editor (Gutenberg core), ensuring flexibility and independence from Core.

This package prioritizes consistency with `wp-admin`, delivering a seamless and scalable admin experience with minimal external dependencies.

## Installation

```sh
npm install @automattic/site-admin
```

or

```sh
yarn add @automattic/site-admin
```

## Designed for Versatility

While primarily built for WordPress-based projects, `@automattic/site-admin` is designed to be flexible enough for other applications. 

By providing a self-contained framework, it enables the development of custom dashboards and interfaces, even in environments that do not rely on the traditional WordPress plugin architecture.

## Scope and Development Principles

### Independence from Gutenberg Core

This package is a standalone solution, not tightly coupled to Gutenberg Core's source code. While some components are adapted for efficiency, the objective is not to fork or replicate Core but to offer a well-structured and optimized implementation for specific admin UI needs.

That said, aligning with Core's guidelines ensures compatibility, maintainability, and potential future contributions to WordPress Core. 

While developed independently, parts of this package—or even the entire package—could eventually be integrated into Core if beneficial to the broader WordPress ecosystem. Regardless of whether this migration occurs, adhering to Core's best practices enhances productivity and ensures long-term integration possibilities.

### Consistency in Design and Behavior

Maintaining a visually and functionally consistent experience with the WordPress admin is a priority. 

The package is designed as a reliable foundation for administrative applications, ensuring a cohesive and intuitive experience across different projects.

### Minimal External Dependencies

- Leverages WordPress dependencies whenever possible.
- Avoids integrating external frameworks unless absolutely necessary due to Core limitations.
- Hosted within the Calypso monorepo for centralization but remains independent of its libraries.

## Getting Started: Building Your Admin UI

This section provides a basic guide to creating a complete admin interface using the components provided by this package.

The following example demonstrates how navigation is structured within the sidebar.
It includes a sidebar layout, individual navigation items, and a routing context to manage navigation state dynamically.

## 1. Navigation System

### 1.1 The `RouterProvider` Component

At the core of the navigation system is the `RouterProvider` component,
which establishes a routing context to manage navigation state
throughout your application.

```tsx
<RouterProvider routes={ [your-routes-here] }>
  { /* Your application content */ }
</RouterProvider>
```

The `routes` property is an array of route definitions that map paths to handlers. The optional `pathArg` property defines the URL query parameter that stores the current path (defaults to `p` if not specified).

## 2. The App Sidebar

### 2.1 Defining Routes

Before creating navigation elements, we need to define the routes that our application will use. Each route must have a unique name, a path, and optionally areas and width configurations.

```tsx
// Define our application routes
const appRoutes = [
  {
    name: 'reports',
    path: '/reports',
    areas: {
      content: <ReportsScreen />
    },
    widths: {
      content: 100
    }
  },
  {
    name: 'settings',
    path: '/settings',
    areas: {
      content: <SettingsScreen />
    },
  },
  {
    name: 'archive',
    path: '/archive',
    areas: {
      content: <ArchiveScreen />
    },
  }
];
```

### 2.2 Defining Sidebar Content

The `SidebarContent` component renders navigation items within the sidebar. Each item corresponds to a specific route, and the `useLocation` hook determines whether it is active.

```tsx
const SidebarContent = () => {
    const { path } = useLocation();

    return (
        <ItemGroup>
            <SidebarNavigationItem
                icon={ navigation }
                key="sidebar-item-reports"
                to="/reports"
                uid="reports"
                aria-current={ path === '/reports' }
            >
                { __( 'Reports', 'a8c-site-admin' ) }
            </SidebarNavigationItem>

            <SidebarNavigationItem
                icon={ settings }
                key="sidebar-item-settings"
                to="/settings"
                uid="settings"
                aria-current={ path === '/settings' }
            >
                { __( 'Settings', 'a8c-site-admin' ) }
            </SidebarNavigationItem>

            <SidebarNavigationItem
                icon={ archive }
                key="sidebar-item-archive"
                to="/archive"
                uid="archive"
                aria-current={ path === '/archive' }
            >
                { __( 'Archive', 'a8c-site-admin' ) }
            </SidebarNavigationItem>
        </ItemGroup>
    );
};
```

### 2.3 Integrating the Navigation System

Once the routes and navigation elements are defined, we integrate them
into the `RouterProvider` and `SidebarNavigationScreen`.
The `RouterProvider` manages the navigation state and provides
the necessary context for the navigation elements to work correctly.

```tsx
<RouterProvider routes={ appRoutes } pathArg="page">
    <SidebarContent>
        <SidebarNavigationScreen
            isRoot
            title={ __( 'Home', 'a8c-site-admin' ) }
            content={ <SidebarContent /> }
        />
        
        {/* The main content will be rendered according to the active route */}
        <div className="site-admin-main-content">
            {/* Here we can use a component that displays content based on the current route */}
            <MainContent />
        </div>
    </SidebarContent>
</RouterProvider>
```

### 2.4 Component to Display Active Route Content

To complete our navigation system, we can create a component that displays
the content corresponding to the active route:

```tsx
const MainContent = () => {
    // Get information about the current route
    const match = useLocation();
    
    // If there's no match, show a message or redirect
    if ( ! match ) {
        return <h1>404</h1>;
    }
    
    // Render the content area defined in the route
    return <>{ match.areas.content }</>;
};
```
