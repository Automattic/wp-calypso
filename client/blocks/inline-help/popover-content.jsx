import { Button, Gridicon } from '@automattic/components';
import { withMobileBreakpoint } from '@automattic/viewport-react';
import { __ } from '@wordpress/i18n';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import InlineHelpContactView from 'calypso/blocks/inline-help/inline-help-contact-view';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { VIEW_CONTACT, VIEW_RICH_RESULT } from './constants';
import InlineHelpRichResult from './inline-help-rich-result';
import InlineHelpSearchCard from './inline-help-search-card';
import InlineHelpSearchResults from './inline-help-search-results';
import './popover-content.scss';

class InlineHelpPopoverContent extends Component {
	static propTypes = {
		onClose: PropTypes.func.isRequired,
		showVideoResult: PropTypes.func.isRequired,
	};

	state = {
		searchQuery: '',
		activeSecondaryView: null,
		selectedResult: null,
	};

	secondaryViewRef = createRef();

	setSearchQuery = ( searchQuery ) => {
		this.setState( { searchQuery } );
	};

	openResultView = ( event, result ) => {
		event.preventDefault();
		this.setState( { selectedResult: result } );
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

	openSecondaryView = ( secondaryViewKey ) => {
		this.props.recordTracksEvent( `calypso_inlinehelp_${ secondaryViewKey }_show`, {
			location: 'inline-help-popover',
		} );
		// Focus the secondary popover contents after the state is set
		this.setState( { activeSecondaryView: secondaryViewKey }, () => {
			const contentTitle = this.secondaryViewRef.current.querySelector( 'h2' );

			if ( contentTitle ) {
				contentTitle.focus();
			}
		} );
	};

	closeSecondaryView = () => {
		this.props.recordTracksEvent( `calypso_inlinehelp_${ this.state.activeSecondaryView }_hide`, {
			location: 'inline-help-popover',
		} );
		this.setState( {
			activeSecondaryView: null,
			selectedResult: null,
		} );
	};

	openContactView = () => {
		this.openSecondaryView( VIEW_CONTACT );
	};

	renderPopoverFooter() {
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

	renderPopoverContent() {
		return (
			<>
				<div className="inline-help__search">
					<InlineHelpSearchCard
						searchQuery={ this.state.searchQuery }
						onSearch={ this.setSearchQuery }
						isVisible={ ! this.state.activeSecondaryView }
					/>
					<InlineHelpSearchResults
						onSelect={ this.openResultView }
						onAdminSectionSelect={ this.setAdminSection }
						searchQuery={ this.state.searchQuery }
					/>
				</div>
				{ this.renderSecondaryView() }
			</>
		);
	};

	renderSecondaryView() {
		const { onClose, showVideoResult } = this.props;
		const { searchQuery, selectedResult } = this.state;
		const classes = classNames(
			'inline-help__secondary-view',
			`inline-help__${ this.state.activeSecondaryView }`
		);

		return (
			<section ref={ this.secondaryViewRef } className={ classes }>
				{
					{
						[ VIEW_CONTACT ]: (
							<>
								<h2 className="inline-help__title" tabIndex="-1">
									{ __( 'Get Support' ) }
								</h2>
								<InlineHelpContactView />
							</>
						),
						[ VIEW_RICH_RESULT ]: (
							<InlineHelpRichResult
								showVideoResult={ showVideoResult }
								closePopover={ onClose }
								result={ selectedResult }
								searchQuery={ searchQuery }
							/>
						),
					}[ this.state.activeSecondaryView ]
				}
			</section>
		);
	};

	render() {
		const className = classNames( 'inline-help__popover-content', {
			'is-secondary-view-active': this.state.activeSecondaryView,
		} );

		return (
			<div className={ className }>
				{ this.renderPopoverContent() }
				{ this.renderPopoverFooter() }
			</div>
		);
	}
}

export default withMobileBreakpoint(
	connect( null, { recordTracksEvent } )( localize( InlineHelpPopoverContent ) )
);
