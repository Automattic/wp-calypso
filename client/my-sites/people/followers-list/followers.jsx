/* eslint-disable wpcalypso/jsx-classname-namespace */
import { FEATURE_UNLIMITED_SUBSCRIBERS } from '@automattic/calypso-products';
import { Card, Button } from '@automattic/components';
import { AddSubscriberForm } from '@automattic/subscriber';
import { localize } from 'i18n-calypso';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import EmailVerificationGate from 'calypso/components/email-verification/email-verification-gate';
import EmptyContent from 'calypso/components/empty-content';
import InfiniteList from 'calypso/components/infinite-list';
import ListEnd from 'calypso/components/list-end';
import accept from 'calypso/lib/accept';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';
import { addQueryArgs } from 'calypso/lib/url';
import NoResults from 'calypso/my-sites/no-results';
import PeopleListItem from 'calypso/my-sites/people/people-list-item';
import PeopleListSectionHeader from 'calypso/my-sites/people/people-list-section-header';
import { isBusinessTrialSite } from 'calypso/sites-dashboard/utils';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';
import isEligibleForSubscriberImporter from 'calypso/state/selectors/is-eligible-for-subscriber-importer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import InviteButton from '../invite-button';

class Followers extends Component {
	infiniteList = createRef();

	renderPlaceholders() {
		return <PeopleListItem key="people-list-item-placeholder" />;
	}

	fetchNextPage = () => {
		const analyticsAction =
			'email' === this.props.type
				? 'Fetched more email followers with infinite list'
				: 'Fetched more followers with infinite list';

		this.props.fetchNextPage();
		this.props.recordGoogleEvent( 'People', analyticsAction, 'page', this.props.currentPage + 1 );
	};

	removeFollower( follower ) {
		const { site, type } = this.props;
		const listType = 'email' === this.props.type ? 'Email Follower' : 'Follower';
		this.props.recordGoogleEvent(
			'People',
			'Clicked Remove Follower Button On' + listType + ' list'
		);
		accept(
			<div>
				<p>
					{ this.props.translate(
						'Removing followers makes them stop receiving updates from your site. If they choose to, they can still visit your site, and follow it again.'
					) }
				</p>
			</div>,
			( accepted ) => {
				if ( accepted ) {
					this.props.recordGoogleEvent(
						'People',
						'Clicked Remove Button In Remove ' + listType + ' Confirmation'
					);
					this.props.removeFollower( site.ID, type, follower.ID );
				} else {
					this.props.recordGoogleEvent(
						'People',
						'Clicked Cancel Button In Remove ' + listType + ' Confirmation'
					);
				}
			},
			this.props.translate( 'Remove', { context: 'Confirm Remove follower button text.' } )
		);
	}

	renderFollower = ( follower ) => {
		return (
			<PeopleListItem
				key={ follower.ID }
				user={ follower }
				type="follower"
				site={ this.props.site }
				onRemove={ () => this.removeFollower( follower ) }
			/>
		);
	};

	getFollowerRef = ( follower ) => {
		return 'follower-' + follower.ID;
	};

	noFollowerSearchResults() {
		return this.props.search && this.siteHasNoFollowers();
	}

	siteHasNoFollowers() {
		const { followers, isFetching } = this.props;
		return ! followers.length && ! isFetching;
	}

	renderInviteFollowersAction( isPrimary = true ) {
		const { site, includeSubscriberImporter } = this.props;

		return (
			<InviteButton
				primary={ isPrimary }
				siteSlug={ site.slug }
				includeSubscriberImporter={ includeSubscriberImporter }
			/>
		);
	}

	render() {
		if ( this.noFollowerSearchResults() ) {
			return (
				<NoResults
					image="/calypso/images/people/mystery-person.svg"
					text={ this.props.translate( 'No results found for {{em}}%(searchTerm)s{{/em}}', {
						args: { searchTerm: this.props.search },
						components: { em: <em /> },
					} ) }
				/>
			);
		}

		let emptyTitle;
		const site = this.props.site;
		const hasUnlimitedSubscribers = this.props.siteHasUnlimitedSubscribers;
		const isFreeSite = site?.plan?.is_free ?? false;
		const isBusinessTrial = site ? isBusinessTrialSite( site ) : false;
		const hasSubscriberLimit = ( isFreeSite || isBusinessTrial ) && ! hasUnlimitedSubscribers;

		if ( this.siteHasNoFollowers() ) {
			if ( 'email' === this.props.type ) {
				if ( this.props.includeSubscriberImporter ) {
					return (
						<Card>
							<EmailVerificationGate
								noticeText={ this.props.translate(
									'You must verify your email to add subscribers.'
								) }
								noticeStatus="is-info"
							>
								<AddSubscriberForm
									siteId={ this.props.site.ID }
									hasSubscriberLimit={ hasSubscriberLimit }
									flowName="people"
									showSubtitle
									showCsvUpload
									showFormManualListLabel
									recordTracksEvent={ recordTracksEvent }
									onImportFinished={ () => {
										this.props?.refetch?.();
										this.props?.successNotice(
											this.props.translate(
												'Your subscriber list is being processed. Please check your email for status.'
											)
										);
									} }
								/>
							</EmailVerificationGate>
						</Card>
					);
				}
				emptyTitle = preventWidows(
					this.props.translate( 'No one is following you by email yet.' )
				);
			} else {
				emptyTitle = this.props.includeSubscriberImporter
					? preventWidows( this.props.translate( 'No WordPress.com subscribers yet.' ) )
					: preventWidows( this.props.translate( 'No WordPress.com followers yet.' ) );
			}

			return <EmptyContent title={ emptyTitle } action={ this.renderInviteFollowersAction() } />;
		}

		let headerText;
		if ( this.props.totalFollowers ) {
			headerText = this.props.translate(
				'You have %(number)d follower',
				'You have %(number)d followers',
				{
					args: { number: this.props.totalFollowers },
					count: this.props.totalFollowers,
				}
			);

			if ( this.props.type === 'email' ) {
				const translateArgs = {
					args: { number: this.props.totalFollowers },
					count: this.props.totalFollowers,
				};

				headerText = this.props.includeSubscriberImporter
					? this.props.translate(
							'You have %(number)d subscriber receiving updates by email',
							'You have %(number)d subscribers receiving updates by email',
							translateArgs
					  )
					: this.props.translate(
							'You have %(number)d follower receiving updates by email',
							'You have %(number)d followers receiving updates by email',
							translateArgs
					  );
			}
		}

		let followers;
		if ( this.props.followers.length ) {
			if ( this.props.search && this.props.totalFollowers ) {
				headerText = this.props.translate(
					'%(numberPeople)d Follower Matching {{em}}"%(searchTerm)s"{{/em}}',
					'%(numberPeople)d Followers Matching {{em}}"%(searchTerm)s"{{/em}}',
					{
						count: this.props.followers.length,
						args: {
							numberPeople: this.props.totalFollowers,
							searchTerm: this.props.search,
						},
						components: {
							em: <em />,
						},
					}
				);
			}

			followers = (
				<InfiniteList
					key={ this.props.listKey }
					items={ this.props.followers }
					className="followers-list__infinite is-people"
					ref={ this.infiniteList }
					fetchNextPage={ this.fetchNextPage }
					fetchingNextPage={ this.props.isFetchingNextPage }
					lastPage={ ! this.props.hasNextPage }
					getItemRef={ this.getFollowerRef }
					renderLoadingPlaceholders={ this.renderPlaceholders }
					renderItem={ this.renderFollower }
					guessedItemHeight={ 126 }
				/>
			);
		} else {
			followers = this.renderPlaceholders();
		}

		const canDownloadCsv = this.props.type === 'email' && !! this.props.site;
		const downloadListLink = canDownloadCsv
			? addQueryArgs(
					{ page: 'stats', blog: this.props.site.ID, blog_subscribers: 'csv', type: 'email' },
					'https://dashboard.wordpress.com/wp-admin/index.php'
			  )
			: null;

		return (
			<>
				<PeopleListSectionHeader
					isFollower
					isPlaceholder={ this.props.isFetching || this.props.search }
					label={ headerText }
					site={ this.props.site }
				>
					{ downloadListLink && (
						<Button href={ downloadListLink } compact>
							{ this.props.translate( 'Download Data as CSV' ) }
						</Button>
					) }
				</PeopleListSectionHeader>
				<Card className="people-invites__invites-list">{ followers }</Card>
				{ ! this.props.hasNextPage && <ListEnd /> }
			</>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	return {
		includeSubscriberImporter: isEligibleForSubscriberImporter( state ),
		siteHasUnlimitedSubscribers: siteHasFeature(
			state,
			ownProps?.site?.ID,
			FEATURE_UNLIMITED_SUBSCRIBERS
		),
	};
};

export default connect( mapStateToProps, {
	recordGoogleEvent,
	successNotice,
} )( localize( Followers ) );
