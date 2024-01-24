import { Component } from 'react';
import AsyncLoad from 'calypso/components/async-load';

class MySitesNavigation extends Component {
	static displayName = 'MySitesNavigation';

	preventPickerDefault = ( event ) => {
		event.preventDefault();
		event.stopPropagation();
	};

	render() {
		const asyncProps = {
			placeholder: null,
			path: this.props.path,
			siteBasePath: this.props.siteBasePath,
		};
		const asyncSidebar = <AsyncLoad require="calypso/my-sites/sidebar" { ...asyncProps } />;
		return <div className="my-sites__navigation">{ asyncSidebar }</div>;
	}
}

export default MySitesNavigation;
