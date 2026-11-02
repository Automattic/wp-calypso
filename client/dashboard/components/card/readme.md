# Card Component

A temporary wrapper component for `@wordpress/components` Card that provides responsive padding control.

## Usage

See `@wordpress/components` for usage.

## Stacking header content

`CardHeader` and `CardFooter` render a `Flex` and accept its props. To stack header content at full width, such as a `SectionHeader` above a `Notice`, use those props instead of a style override:

```tsx
<CardHeader direction="column" expanded={ false } gap={ 4 }>
	<SectionHeader title={ __( 'Title' ) } />
	<Notice variant="info">{ __( 'Message' ) }</Notice>
</CardHeader>
```

Pass `expanded={ false }`: a column `Flex` otherwise sets `height: 100%`, and in a card with a constrained height the header grows over the card body.
