/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import Gridicon from 'components/gridicon';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';

class SidebarNavigation extends React.Component {
	constructor( props ) {
		super( props );
		this.toggleSidebar = this.toggleSidebar.bind( this );
	}

	toggleSidebar( event ) {
		event.preventDefault();
		this.props.setLayoutFocus( 'sidebar' );
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
	sectionName: PropTypes.string.isRequired,
	setLayoutFocus: PropTypes.func.isRequired,
};

export default connect( null, { setLayoutFocus } )( SidebarNavigation );
