import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import { withCurrentRoute } from 'calypso/components/route';
import LayoutLoader from 'calypso/layout/loader';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';

class Layout extends Component {
	static propTypes = {
		primary: PropTypes.element,
		secondary: PropTypes.element,
		focus: PropTypes.object,
		// connected props
		currentLayoutFocus: PropTypes.string,
	};

	render() {
		const sectionClass = clsx( 'layout', `focus-${ this.props.currentLayoutFocus }`, {
			[ 'is-group-' + this.props.sectionGroup ]: this.props.sectionGroup,
			[ 'is-section-' + this.props.sectionName ]: this.props.sectionName,
			'is-support-session': this.props.isSupportSession,
			'has-no-sidebar': this.props.sidebarIsHidden,
			'has-docked-chat': this.props.chatIsOpen && this.props.chatIsDocked,
			'has-no-masterbar': this.props.masterbarIsHidden,
			'is-jetpack-login': this.props.isJetpackLogin,
			'is-jetpack-site': this.props.isJetpack,
		} );

		return (
			<div className={ sectionClass }>
				<DocumentHead />
				<LayoutLoader />
				<div id="content" className="layout__content">
					<div id="secondary" className="layout__secondary" role="navigation">
						{ this.props.secondary }
					</div>
					<div id="primary" className="layout__primary">
						{ this.props.primary }
					</div>
				</div>
			</div>
		);
	}
}

export default withCurrentRoute(
	connect( ( state ) => {
		return {
			currentLayoutFocus: getCurrentLayoutFocus( state ),
		};
	} )( Layout )
);
