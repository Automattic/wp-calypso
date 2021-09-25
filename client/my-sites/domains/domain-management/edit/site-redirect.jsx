import React from 'react';
import Edit from './index';

class SiteRedirect extends React.PureComponent {
	render() {
		return <Edit { ...this.props } isSiteRedirect={ true } />;
	}
}

export default SiteRedirect;
