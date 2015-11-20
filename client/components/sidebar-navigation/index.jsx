/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal Dependencies
 */
import layoutFocus from 'lib/layout-focus';

class SidebarNavigation extends React.Component {
	toggleSidebar( event ) {
		event.preventDefault();
		layoutFocus.set( 'sidebar' );
	}

	render() {
		return (
			<header className="current-section">
				<a onTouchTap={ this.toggleSidebar } className={ this.props.linkClassName }>
					{ this.props.children }
					<p className={ 'current-section__' + this.props.sectionName + '-title' }>{ this.props.sectionTitle }</p>
					<h1 className="current-section__section-title">{ this.props.title }</h1>
					<span className="noticon noticon-collapse" />
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
