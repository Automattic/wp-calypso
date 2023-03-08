import { UniversalNavbarHeader } from '@automattic/wpcom-template-parts';
import { renderToStaticMarkup } from 'react-dom/server';

export default () => renderToStaticMarkup( <UniversalNavbarHeader isLoggedIn /> );
