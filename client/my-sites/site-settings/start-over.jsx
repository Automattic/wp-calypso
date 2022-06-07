import { Button, Card } from '@automattic/components';
import { CheckboxControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import ExternalLink from 'calypso/components/external-link';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import wpcom from 'calypso/lib/wp';
import getAtomicTransfer from 'calypso/state/selectors/get-atomic-transfer';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

class StartOver extends Component {
	state = {
		atomicRevertCheckOne: false,
		atomicRevertCheckTwo: false,
		simpleRevertCheckOne: false,
		simpleRevertCheckTwo: false,
		isEmptyButtonBusy: false,
	};

	static defaultProps = {
		atomicTransfer: false,
	};

	getCheckboxConsent() {
		const { selectedSiteSlug, translate } = this.props;
		const {
			atomicRevertCheckOne,
			atomicRevertCheckTwo,
			atomicTransfer,
			simpleRevertCheckOne,
			simpleRevertCheckTwo,
		} = this.state;

		if ( atomicTransfer ) {
			return (
				<>
					<CheckboxControl
						className="start-over__checkbox-container"
						label={ translate(
							'Any themes/plugins you have installed on the site will be removed, along with their data.'
						) }
						checked={ atomicRevertCheckOne }
						onChange={ ( isChecked ) => this.setState( { atomicRevertCheckOne: isChecked } ) }
					/>
					<CheckboxControl
						className="start-over__checkbox-container"
						label={ translate(
							'Your site will return to its original settings and theme right before the first plugin or custom theme was installed.'
						) }
						checked={ atomicRevertCheckTwo }
						onChange={ ( isChecked ) => this.setState( { atomicRevertCheckTwo: isChecked } ) }
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
					onChange={ ( isChecked ) => this.setState( { simpleRevertCheckOne: isChecked } ) }
				/>
				<CheckboxControl
					className="start-over__checkbox-container"
					label={ translate(
						'I understand that there is no way to retrieve my data unless I have downloaded a backup.'
					) }
					checked={ simpleRevertCheckTwo }
					onChange={ ( isChecked ) => this.setState( { simpleRevertCheckTwo: isChecked } ) }
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

	render() {
		const atomicTransferDate = null;
		const { selectedSiteSlug, translate, atomicTransfer } = this.props;
		const {
			atomicRevertCheckOne,
			atomicRevertCheckTwo,
			simpleRevertCheckOne,
			simpleRevertCheckTwo,
			isEmptyButtonBusy,
		} = this.state;
		let canClickEmptyButton;
		let subHeaderText;

		if ( Object.keys( atomicTransfer ).length ) {
			canClickEmptyButton = atomicRevertCheckOne && atomicRevertCheckTwo;
			subHeaderText = translate(
				'After emptying your site, we will return your site back to the point when you installed your first plugin or custom theme or activated hosting features on {{strong}}%(atomicTransferDate)s{{/strong}}. All your posts, pages and media will be deleted.',
				{
					args: { atomicTransferDate },
					components: {
						// eslint-disable-next-line wpcalypso/jsx-classname-namespace
						strong: <strong className="is-highlighted" />,
					},
				}
			);
		} else {
			canClickEmptyButton = simpleRevertCheckOne && simpleRevertCheckTwo;
		}

		return (
			<>
				<div
					className="main main-column start-over" // eslint-disable-line wpcalypso/jsx-classname-namespace
					role="main"
				>
					<HeaderCake backHref={ '/settings/general/' + selectedSiteSlug }>Start Over</HeaderCake>
					<Card>
						<FormattedHeader brandFont headerText={ translate( 'Start Over' ) } />
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
				<div className=" main main-column start-over start-over__confirm">
					<Card>
						<FormattedHeader
							brandFont
							headerText={ translate( 'Proceed with caution' ) }
							subHeaderText={ subHeaderText }
						/>
						<p>
							{ translate(
								'Please {{strong}}confirm and check{{/strong}} the following items before you continue with emptying your site:',
								{ components: { strong: <strong /> } }
							) }
						</p>
						{ this.getCheckboxConsent() }

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
							disabled={ ! canClickEmptyButton }
							onClick={ this.clickEmptySiteButton }
							className="start-over__empty-site-button"
							busy={ isEmptyButtonBusy }
						>
							{ translate( 'Empty Site' ) }
						</Button>
					</Card>
				</div>
			</>
		);
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		selectedSiteSlug: getSelectedSiteSlug( state ),
		atomicTransfer: getAtomicTransfer( state, siteId ),
		siteId,
	};
} )( localize( StartOver ) );
