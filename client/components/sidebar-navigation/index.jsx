/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal Dependencies
 */
import layoutFocus from 'lib/layout-focus';
import Gridicon from 'components/gridicon';

class SidebarNavigation extends React.Component {
	toggleSidebar( event ) {
		event.preventDefault();
		layoutFocus.set( 'sidebar' );
	}

	render() {
		return (
			<header className="current-section">
				<a onTouchTap={ this.toggleSidebar } className={ this.props.linkClassName }>
					<Gridicon icon="chevron-left" />
					{ this.props.children }
					<div>
						<p className={ 'current-section__' + this.props.sectionName + '-title' }>{ this.props.sectionTitle }</p>
						<h1 className="current-section__section-title">{ this.props.title }</h1>
					</div>
				</a>
			</header>
		);
	}
};

SidebarNavigation.propTypes = {
	title: PropTypes.string,
	linkClassName: PropTypes.string,
	sectionTitle: PropTypes.string,
	sectionName: PropTypes.string.isRequired
};

export default SidebarNavigation;
