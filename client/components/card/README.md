Card
=========

This is a set of two very similar components to be used as containers. One is the `Card` component and the other is `CompactCard`. As you may have already guessed, the latter is a bit more compact and meant more for list items.

The `CompactCard` component slightly modifies the `Card` component.


## Usage

```jsx
import Card from 'components/card';
import CompactCard from 'components/card/compact';

render: function() {
  return (
    <div className="your-stuff">
      <Card>
        <span>Your stuff in a Card</span>
      </Card>

      <CompactCard>
        <span>Your stuff in a CompactCard</span>
      </CompactCard>
    </div>
  );
}
```

## Props

Name | Type | Default | Description
--- | --- | --- | ---
`className` | `string` | null | You can add classes to either.
`href` | `string` | null | (Optional) If set then the card becomes a link, with a Gridicons chevron on the right.
`tagName` | `string` | null | (Optional) Allows you to control the tag name of the card wrapper (only if `href` is not specified).
`target` | `string` | null | (Optional) If set and used with `href` then this controls where the link opens. It also changes the Gridicon to "external."
`compact` | `bool` | false | (Optional) Whether the card should be rendered as compact.
`highlight` | `string` | `false` | (Optional) The specific highlight of this card. Can be one of the following: `false` (no highlight, default), `info`, `success`, `error`, or `warning`.
