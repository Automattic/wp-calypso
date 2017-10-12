Domain form fieldsets
===============

This is a directory of fieldsets that the domain details checkout form (`domain-details-form.jsx`) conditionally renders, based on the contents of the user's cart or his or her country.

At the moment it is rather closely coupled with the individual form input components' props requirements. See: `my-sites/domains/components/form`

##  region-address-fieldsets.jsx

Will render the appropriate address fieldset component based on the provided `countryCode`.

Usage:

```
    const getFieldProps = () => {
        return {
            // ...form props
        }
    },
    countryCode = 'FR';
    
    //render
    <RegionAddressFieldsets
        getFieldProps={ getFieldProps }
        countryCode={ countryCode }
    />
```

#### Props

`getFieldProps` _{Function}_ 

Returns an object of props expected by our form input components: `my-sites/domains/components/form`

`countryCode` _{String}_ 

The user's country code, for example: 'AU', 'GB', 'IT', 'US' and so on.


## g-apps-fieldset.jsx

Renders the fieldset for when the user's cart contains a Google app only (and no domain items)

Usage:

```
    const getFieldProps = () => {
        return {
            // ...form props
        }
    };
    
    // render
    <GAppsFieldset getFieldProps={ this.getFieldProps } />
```

#### Props

`getFieldProps` _{Function}_ 

Returns an object of props expected by our form input components: `my-sites/domains/components/form`





