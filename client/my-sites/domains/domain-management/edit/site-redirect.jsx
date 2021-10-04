import { PureComponent } from 'react';
import Edit from './index';

class SiteRedirect extends PureComponent {
	render() {
		return <Edit { ...this.props } isSiteRedirect={ true } />;
	}
}

export default SiteRedirect;
