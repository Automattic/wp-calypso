import { Button, Card } from '@automattic/components';
import { CheckboxControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import ExternalLink from 'calypso/components/external-link';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import wpcom from 'calypso/lib/wp';
import { fetchAtomicTransfer } from 'calypso/state/atomic-transfer/actions';
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
		const { siteId } = this.props;

		if ( this.props.isAtomicSite && siteId ) {
			this.props.fetchAtomicTransfer( siteId );
		}
	}

	getCheckboxContent( hasAtomicTransferCompleted = false ) {
		const { selectedSiteSlug, translate } = this.props;
		const {
			atomicRevertCheckOne,
			atomicRevertCheckTwo,
			simpleRevertCheckOne,
			simpleRevertCheckTwo,
		} = this.state;

		if ( hasAtomicTransferCompleted ) {
			return (
				<>
					<CheckboxControl
						className="start-over__checkbox-container"
						label={ translate(
							'Any themes/plugins you have installed on the site will be removed, along with their data.'
						) }
						checked={ atomicRevertCheckOne }
						onChange={ ( isChecked ) => this.setState( { checkOne: isChecked } ) }
					/>
					<CheckboxControl
						className="start-over__checkbox-container"
						label={ translate(
							'Your site will return to its original settings and theme right before the first plugin or custom theme was installed.'
						) }
						checked={ atomicRevertCheckTwo }
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
					checked={ simpleRevertCheckOne }
					onChange={ ( isChecked ) => this.setState( { checkOne: isChecked } ) }
				/>
				<CheckboxControl
					className="start-over__checkbox-container"
					label={ translate(
						'I understand that there is no way to retrieve my data unless I have downloaded a backup.'
					) }
					checked={ simpleRevertCheckTwo }
					onChange={ ( isChecked ) => this.setState( { checkTwo: isChecked } ) }
				/>
			</>
		);
	}

	clickEmptySiteButton = async () => {
		const { siteId } = this.props;
		this.setState( { isEmptyButtonBusy: true } );
		const params = { site_id: siteId };

		const response = await wpcom.req.post(
			{
				apiNamespace: 'wpcom/v2',
				path: '/empty-site',
			},
			params
		);
		if ( ! response.success ) {
			this.setState( { isEmptyButtonBusy: false } );
			// Set notice about error
		}

		const currentPageUrl = new URL( document.location );
		currentPageUrl.searchParams.append( 'empty', 'success' );
		window.location.href = currentPageUrl.toString();
	};

	getSubheaderText( hasAtomicTransferCompleted = false ) {
		const { atomicTransfer, moment, translate } = this.props;
		const atomicTransferDate = moment( atomicTransfer.created_at ).format( 'LL' );

		if ( ! hasAtomicTransferCompleted ) {
			return;
		}

		return translate(
			'After emptying your site, we will return your site back to the point when you installed your first plugin or custom theme or activated hosting features on {{strong}}%(atomicTransferDate)s{{/strong}}. All your posts, pages and media will be deleted.',
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
		const { translate, selectedSiteSlug, atomicTransfer } = this.props;
		const { checkOne, checkTwo, isEmptyButtonBusy } = this.state;
		const shouldEnableButton = checkOne && checkTwo;
		const hasAtomicTransferCompleted = Object.keys( atomicTransfer ).length > 0;

		return (
			<div className=" main main-column start-over start-over__confirm">
				<Card>
					<FormattedHeader
						brandFont
						headerText={ translate( 'Proceed with caution - this will delete all your content' ) }
						subHeaderText={ this.getSubheaderText( hasAtomicTransferCompleted ) }
					/>
					<p>
						{ translate(
							'Please {{strong}}confirm and check{{/strong}} the following items before you continue with emptying your site:',
							{ components: { strong: <strong /> } }
						) }
					</p>
					{ this.getCheckboxContent( hasAtomicTransferCompleted ) }

					<div className="start-over__backups">
						<h4>{ translate( 'Would you like to download the backup of your site?' ) }</h4>
						<p>
							{ translate(
								'If you change your mind later or want to secure your data, you can download a backup.'
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

	render() {
		const { selectedSiteSlug, translate } = this.props;

		return (
			<>
				<div
					className="main main-column start-over" // eslint-disable-line wpcalypso/jsx-classname-namespace
					role="main"
				>
					<HeaderCake backHref={ '/settings/general/' + selectedSiteSlug }>Start Over</HeaderCake>
					<Card>
						{ /* <FormattedHeader brandFont headerText={ translate( 'Start Over' ) } /> */ }
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
	{ fetchAtomicTransfer }
)( localize( withLocalizedMoment( StartOver ) ) );
