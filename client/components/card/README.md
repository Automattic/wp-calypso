Card
=========

This is a set of two very similar components to be used as containers. One is the `Card` component and the other is `CompactCard`. As you may have already guessed, the latter is a bit more compact and meant more for list items.

The `CompactCard` component slightly modifies the `Card` component.


#### How to use:

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

#### Props

* `className`: You can add classes to either.
* `href` (Optional): If set then the card becomes a link, with a Gridicon chevron on the right.
* `target` (Optional): If set and used with `href` then this controls where the link opens. It also changes the Gridicon to "external"
* `compact` (Optional): Whether the card should be rendered as compact
