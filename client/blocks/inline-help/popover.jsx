/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { flowRight as compose, noop } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import Gridicon from 'calypso/components/gridicon';
import { withMobileBreakpoint } from '@automattic/viewport-react';
import { __ } from '@wordpress/i18n';

/**
 * Internal Dependencies
 */
import { VIEW_CONTACT, VIEW_RICH_RESULT } from './constants';
import { selectResult, resetInlineHelpContactForm } from 'calypso/state/inline-help/actions';
import { Button } from '@automattic/components';
import Popover from 'calypso/components/popover';
import InlineHelpSearchResults from './inline-help-search-results';
import InlineHelpSearchCard from './inline-help-search-card';
import InlineHelpRichResult from './inline-help-rich-result';
import getSearchQuery from 'calypso/state/inline-help/selectors/get-search-query';
import getInlineHelpCurrentlySelectedResult from 'calypso/state/inline-help/selectors/get-inline-help-currently-selected-result';
import QuerySupportTypes from 'calypso/blocks/inline-help/inline-help-query-support-types';
import InlineHelpContactView from 'calypso/blocks/inline-help/inline-help-contact-view';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

class InlineHelpPopover extends Component {
	static propTypes = {
		onClose: PropTypes.func.isRequired,
		setDialogState: PropTypes.func.isRequired,
	};

	static defaultProps = {
		onClose: noop,
	};

	state = {
		showSecondaryView: false,
		activeSecondaryView: '',
	};

	secondaryViewRef = React.createRef();

	openResultView = ( event ) => {
		event.preventDefault();
		this.openSecondaryView( VIEW_RICH_RESULT );
	};

	setAdminSection = () => {
		const { isBreakpointActive: isMobile, onClose } = this.props;
		if ( ! isMobile ) {
			return;
		}
		onClose();
	};

	moreHelpClicked = () => {
		this.props.onClose();
		this.props.recordTracksEvent( 'calypso_inlinehelp_morehelp_click', {
			location: 'inline-help-popover',
		} );
	};

	setSecondaryViewKey = ( secondaryViewKey ) => {
		this.setState( { activeSecondaryView: secondaryViewKey } );
	};

	openSecondaryView = ( secondaryViewKey ) => {
		this.setSecondaryViewKey( secondaryViewKey );
		this.props.recordTracksEvent( `calypso_inlinehelp_${ secondaryViewKey }_show`, {
			location: 'inline-help-popover',
		} );
		// Focus the secondary popover contents after the state is set
		this.setState( { showSecondaryView: true }, () => {
			const contentTitle = this.secondaryViewRef.current.querySelector( 'h2' );

			if ( contentTitle ) {
				contentTitle.focus();
			}
		} );
	};

	closeSecondaryView = () => {
		this.setSecondaryViewKey( '' );
		this.props.recordTracksEvent( `calypso_inlinehelp_${ this.state.activeSecondaryView }_hide`, {
			location: 'inline-help-popover',
		} );
		this.props.selectResult( -1 );
		this.props.resetContactForm();
		this.setState( { showSecondaryView: false } );
	};

	openContactView = () => {
		this.openSecondaryView( VIEW_CONTACT );
	};

	renderPopoverFooter = () => {
		const { translate } = this.props;
		return (
			<div className="inline-help__footer">
				<Button
					onClick={ this.moreHelpClicked }
					className="inline-help__more-button"
					borderless
					href="/help"
				>
					<Gridicon icon="help" className="inline-help__gridicon-left" />
					{ translate( 'More help' ) }
				</Button>

				<Button onClick={ this.openContactView } className="inline-help__contact-button" borderless>
					<Gridicon icon="chat" className="inline-help__gridicon-left" />
					{ translate( 'Contact us' ) }
					<Gridicon icon="chevron-right" className="inline-help__gridicon-right" />
				</Button>

				<Button
					onClick={ this.closeSecondaryView }
					className="inline-help__cancel-button"
					borderless
				>
					<Gridicon icon="chevron-left" className="inline-help__gridicon-left" />
					{ translate( 'Back' ) }
				</Button>
			</div>
		);
	};

	renderPopoverContent = () => {
		return (
			<Fragment>
				<QuerySupportTypes />
				<div className="inline-help__search">
					<InlineHelpSearchCard
						onSelect={ this.openResultView }
						query={ this.props.searchQuery }
						isVisible={ ! this.state.showSecondaryView }
					/>
					<InlineHelpSearchResults
						onSelect={ this.openResultView }
						onAdminSectionSelect={ this.setAdminSection }
						searchQuery={ this.props.searchQuery }
					/>
				</div>
				{ this.renderSecondaryView() }
			</Fragment>
		);
	};

	renderSecondaryView = () => {
		const { onClose, selectedResult, setDialogState } = this.props;
		const classes = classNames(
			'inline-help__secondary-view',
			`inline-help__${ this.state.activeSecondaryView }`
		);
		return (
			<section ref={ this.secondaryViewRef } className={ classes }>
				{
					{
						[ VIEW_CONTACT ]: (
							<Fragment>
								<h2 className="inline-help__title" tabIndex="-1">
									{ __( 'Get Support' ) }
								</h2>
								<InlineHelpContactView />
							</Fragment>
						),
						[ VIEW_RICH_RESULT ]: (
							<InlineHelpRichResult
								result={ selectedResult }
								setDialogState={ setDialogState }
								closePopover={ onClose }
							/>
						),
					}[ this.state.activeSecondaryView ]
				}
			</section>
		);
	};

	render() {
		const popoverClasses = {
			'is-secondary-view-active': this.state.showSecondaryView,
		};

		return (
			<Popover
				isVisible
				onClose={ this.props.onClose }
				position="top left"
				context={ this.props.context }
				className={ classNames( 'inline-help__popover', popoverClasses ) }
			>
				{ this.renderPopoverContent() }
				{ this.renderPopoverFooter() }
			</Popover>
		);
	}
}

function mapStateToProps( state ) {
	return {
		searchQuery: getSearchQuery( state ),
		selectedResult: getInlineHelpCurrentlySelectedResult( state ),
	};
}

const mapDispatchToProps = {
	recordTracksEvent,
	selectResult,
	resetContactForm: resetInlineHelpContactForm,
};

export default compose(
	localize,
	connect( mapStateToProps, mapDispatchToProps )
)( withMobileBreakpoint( InlineHelpPopover ) );
