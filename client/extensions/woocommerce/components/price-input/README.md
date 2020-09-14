Price input component. Renders `<FormCurrencyInput/>` if possible, or falls back to a regular `<FormTextInput/>`

Props:

```
value: optional, string or num, the value of the field
currency: required, three-letter code of the currency (for example USD)
```

Will pass other props to the underlying component.
