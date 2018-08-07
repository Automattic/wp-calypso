Rename JSX attribute Babel Transform
====================================

With options:
```js
{
	from: 'className',
	to: 'styleName',
}
```

This JSX:
```js
<Elem className='fizzbuzz' />
```

...becomes:
```js
<Elem styleName='fizzbuzz' />
```
