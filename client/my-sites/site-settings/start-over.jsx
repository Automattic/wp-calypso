import { Button, Card } from '@automattic/components';
import { CheckboxControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelBody from 'calypso/components/action-panel/body';
import ActionPanelFigure from 'calypso/components/action-panel/figure';
import ActionPanelTitle from 'calypso/components/action-panel/title';
import ExternalLink from 'calypso/components/external-link';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import wpcom from 'calypso/lib/wp';
import { fetchAtomicTransfer } from 'calypso/state/atomic-transfer/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import getAtomicTransfer from 'calypso/state/selectors/get-atomic-transfer';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

class StartOver extends Component {
	state = {
		checkOne: false,
		checkTwo: false,
		isEmptyButtonBusy: false,
	};

	static defaultProps = {
		atomicTransfer: false,
	};

	componentDidMount() {
		const { siteId, translate } = this.props;

		if ( this.props.isAtomicSite && siteId ) {
			this.props.fetchAtomicTransfer( siteId );
		}

		if ( this.props.queryParams?.empty === 'success' ) {
			this.props.successNotice( translate( "Site's contents successfully deleted." ) );
		}
	}

	getCheckboxContent() {
		const { selectedSiteSlug, isAtomicSite, translate } = this.props;
		const { checkTwo, checkOne } = this.state;

		if ( isAtomicSite ) {
			return (
				<>
					<CheckboxControl
						className="start-over__checkbox-container"
						label={ translate(
							'Any themes/plugins you have installed on the site will be removed, along with their data.'
						) }
						checked={ checkOne }
						onChange={ ( isChecked ) => this.setState( { checkOne: isChecked } ) }
					/>
					<CheckboxControl
						className="start-over__checkbox-container"
						label={ translate(
							"I understand that without taking a backup, my site's data such as posts, pages, media, comments, tags, and themes are permanently deleted and cannot be retrieved."
						) }
						checked={ checkTwo }
						onChange={ ( isChecked ) => this.setState( { checkTwo: isChecked } ) }
					/>
				</>
			);
		}

		return (
			<>
				<CheckboxControl
					className="start-over__checkbox-container"
					label={ translate(
						`All data for {{strong}}%(selectedSiteSlug)s{{/strong}} will be deleted. This includes posts, pages, media, comments, tags, and themes.`,
						{
							args: { selectedSiteSlug },
							components: {
								// eslint-disable-next-line wpcalypso/jsx-classname-namespace
								strong: <strong className="is-highlighted" />,
							},
						}
					) }
					checked={ checkOne }
					onChange={ ( isChecked ) => this.setState( { checkOne: isChecked } ) }
				/>
				<CheckboxControl
					className="start-over__checkbox-container"
					label={ translate(
						"I understand that without taking a backup, my site's data is permanently deleted and cannot be retrieved."
					) }
					checked={ checkTwo }
					onChange={ ( isChecked ) => this.setState( { checkTwo: isChecked } ) }
				/>
			</>
		);
	}

	clickEmptySiteButton = async ( event ) => {
		event.preventDefault();
		const { siteId } = this.props;
		this.setState( { isEmptyButtonBusy: true } );
		const params = { site_id: siteId };

		try {
			const response = await wpcom.req.post(
				{
					apiNamespace: 'wpcom/v2',
					path: '/empty-site',
				},
				params
			);

			if ( ! response?.success ) {
				throw new Error( 'Failed to empty site' );
			}

			const currentPageUrl = new URL( document.location );
			currentPageUrl.searchParams.append( 'empty', 'success' );
			window.location.href = currentPageUrl.toString();
		} catch ( error ) {
			this.setState( { isEmptyButtonBusy: false } );
			this.props.errorNotice(
				this.props.translate( 'Looks like something went wrong. Try again or contact support.' )
			);
			throw error;
		}
	};

	getSubheaderText() {
		const { atomicTransfer, isAtomicSite, moment, translate } = this.props;
		const atomicTransferDate = moment( atomicTransfer.created_at ).format( 'LL' );

		if ( ! isAtomicSite ) {
			return;
		}

		return translate(
			'After emptying your site, we will return your site back to the point when you installed your first plugin or custom theme or activated ' +
				'hosting features on {{strong}}%(atomicTransferDate)s{{/strong}}. All your posts, pages and media will be deleted.',
			{
				args: { atomicTransferDate },
				components: {
					// eslint-disable-next-line wpcalypso/jsx-classname-namespace
					strong: <strong className="is-highlighted" />,
				},
			}
		);
	}

	renderEmptySiteConfirmationContent() {
		const { translate, selectedSiteSlug } = this.props;
		const { checkOne, checkTwo, isEmptyButtonBusy } = this.state;
		const shouldEnableButton = checkOne && checkTwo;

		return (
			<div className=" main main-column start-over start-over__confirm">
				<Card>
					<FormattedHeader
						brandFont
						headerText={ translate( 'Proceed with caution - this will delete all your content' ) }
						subHeaderText={ this.getSubheaderText() }
					/>
					<p>
						{ translate(
							'Please {{strong}}confirm and check{{/strong}} the following items before you continue with emptying your site:',
							{ components: { strong: <strong /> } }
						) }
					</p>
					{ this.getCheckboxContent() }

					<div className="start-over__backups">
						<h4>{ translate( 'Would you like to download the backup of your site?' ) }</h4>
						<p>
							{ translate(
								'It is recommended that you backup your current data, so that you can restore it if you change your mind later.'
							) }
						</p>
						<ExternalLink icon href={ `/backup/${ selectedSiteSlug }` }>
							{ translate( 'Go to your backups' ) }
						</ExternalLink>
					</div>
					<Button
						primary
						scary
						disabled={ ! shouldEnableButton }
						onClick={ this.clickEmptySiteButton }
						className="start-over__empty-site-button"
						busy={ isEmptyButtonBusy }
					>
						{ translate( 'Empty Site' ) }
					</Button>
				</Card>
			</div>
		);
	}

	renderSuccessContent() {
		const { translate } = this.props;

		return (
			<>
				<div
					className="main main-column start-over" // eslint-disable-line wpcalypso/jsx-classname-namespace
					role="main"
				>
					<HeaderCake backHref={ '/settings/general/' + this.props.selectedSiteSlug }>
						{ translate( 'Start Over' ) }
					</HeaderCake>
					<ActionPanel>
						<ActionPanelBody>
							<ActionPanelFigure inlineBodyText={ true }>
								<img
									src="/calypso/images/wordpress/logo-stars.svg"
									alt=""
									width="170"
									height="143"
								/>
							</ActionPanelFigure>
							<ActionPanelTitle>
								{ translate( 'The contents of your site have been deleted.' ) }
							</ActionPanelTitle>
							<p>
								{ translate(
									"Now that all your site's contents have been deleted, go ahead and start afresh! We can't wait to see what you will create!"
								) }
							</p>
							<p>
								{ translate(
									'To help you get started on the right foot, check out this helpful video tutorial.'
								) }
							</p>
							<p>
								<iframe
									width="560"
									height="315"
									src="https://www.youtube.com/embed/WGUGBPRLtgU"
									title="YouTube video player"
									frameborder="0"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									allowfullscreen
								></iframe>
							</p>
						</ActionPanelBody>
					</ActionPanel>
				</div>
			</>
		);
	}

	render() {
		const { selectedSiteSlug, translate } = this.props;

		if ( this.props.queryParams?.empty === 'success' ) {
			return this.renderSuccessContent();
		}

		return (
			<>
				<div
					className="main main-column start-over" // eslint-disable-line wpcalypso/jsx-classname-namespace
					role="main"
				>
					<HeaderCake backHref={ '/settings/general/' + selectedSiteSlug }>
						{ translate( 'Start Over' ) }
					</HeaderCake>
					<Card>
						<p>
							{ translate(
								"If you want a site but don't want any of the posts and pages you have now, " +
									'then proceed to delete your posts, pages, media, and comments.'
							) }
						</p>
						<p>
							{ translate(
								'This will keep your site and URL active, but give you a fresh start on your content ' +
									'creation.'
							) }
						</p>
					</Card>
				</div>
				{ this.renderEmptySiteConfirmationContent() }
			</>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			selectedSiteSlug: getSelectedSiteSlug( state ),
			atomicTransfer: getAtomicTransfer( state, siteId ),
			isAtomicSite: isSiteAutomatedTransfer( state, siteId ),
			siteId,
		};
	},
	{ fetchAtomicTransfer, errorNotice, successNotice }
)( localize( withLocalizedMoment( StartOver ) ) );
