# Enforce recommended Gridicon size attributes

Gridicon JSX elements must use one of the recommended sizes.

In previous incarnations, this warning could be subdued by adding a `nonStandardSize` prop to the element, but it's recommended instead to disable the rule using standard ESLint rule options ([documentation](http://eslint.org/docs/user-guide/configuring#disabling-rules-with-inline-comments)).

## Rule Details

The following patterns are considered warnings:

```jsx
<Gridicon size={ 20 } />
```

The following patterns are not warnings:

```jsx
<Gridicon size={ 18 } />
```
