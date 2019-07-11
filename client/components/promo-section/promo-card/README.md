Promo Card
==========

A [`Card` component](../../components/card) based on [`ActionPanel'](../../components/action-panel) designed to promote plan features and partnerships.

## Usage

```es6
import PromoCard from 'my-sites/promo-section/promo-card';

const PromoCardExample = () => {
  return (
      <PromoCard title="Under-used Feature">
            <img
              src="/calypso/images/wordpress/logo-stars.svg"
              width="170"
              height="143"
              alt="WordPress logo"
            />
          <p>
            This is a description of the action. It gives a bit more detail and explains what we are
            inviting the user to do.
          </p>
      </PromoCard>
  );
}
```
