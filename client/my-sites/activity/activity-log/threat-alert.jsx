/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import Spinner from 'components/spinner';
import { Interval, EVERY_TEN_SECONDS } from 'lib/interval';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ActivityIcon from '../activity-log-item/activity-icon';
import { Button, Card } from '@automattic/components';
import DiffViewer from 'components/diff-viewer';
import FoldableCard from 'components/foldable-card';
import { JETPACK_CONTACT_SUPPORT } from 'lib/url/support';
import InfoPopover from 'components/info-popover';
import MarkedLines from 'components/marked-lines';
import TimeSince from 'components/time-since';
import PopoverMenuItem from 'components/popover/menu-item';
import SplitButton from 'components/split-button';
import { fixThreatAlert, ignoreThreatAlert } from 'state/jetpack/site-alerts/actions';
import { requestRewindState } from 'state/rewind/state/actions';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './threat-alert.scss';

export class ThreatAlert extends Component {
	state = { requesting: false };

	handleFix = () => {
		this.setState( { requesting: true } );
		this.props.fixThreat( this.props.siteId, this.props.threat.id );
	};

	handleIgnore = () => {
		this.setState( { requesting: true } );
		this.props.ignoreThreat( this.props.siteId, this.props.threat.id );
	};

	handleGetHelp = () => {
		this.props.trackGetHelp( this.props.threat.id );
		window.open( JETPACK_CONTACT_SUPPORT, '_blank' );
	};

	refreshRewindState = () => this.props.requestRewindState( this.props.siteId );

	getDetailType() {
		const { threat } = this.props;

		if ( threat.hasOwnProperty( 'diff' ) ) {
			return 'core';
		}

		if ( threat.hasOwnProperty( 'context' ) ) {
			return 'file';
		}

		if ( threat.hasOwnProperty( 'extension' ) ) {
			// 'plugin' or 'theme'
			return threat.extension.type;
		}

		if ( 'Suspicious.Links' === threat.signature ) {
			return 'database';
		}

		return 'none';
	}

	renderTitle() {
		const {
			threat,
			threat: { extension, filename },
			translate,
		} = this.props;

		const basename = ( s ) => s.replace( /.*\//, '' );

		switch ( this.getDetailType( threat ) ) {
			case 'core':
				return translate( 'The file {{filename/}} has been modified from its original.', {
					components: {
						filename: (
							<code className="activity-log__threat-alert-filename">{ basename( filename ) }</code>
						),
					},
				} );

			case 'file':
				return translate( 'The file {{filename/}} contains a malicious code pattern.', {
					components: {
						filename: (
							<code className="activity-log__threat-alert-filename">{ basename( filename ) }</code>
						),
					},
				} );

			case 'plugin':
				return translate(
					'The plugin {{pluginSlug/}} (version {{version/}}) has a publicly known vulnerability.',
					{
						components: {
							pluginSlug: (
								<span className="activity-log__threat-alert-slug">{ extension.slug }</span>
							),
							version: (
								<span className="activity-log__threat-alert-version">{ extension.version }</span>
							),
						},
					}
				);

			case 'theme':
				return translate(
					'The theme {{themeSlug/}} (version {{version/}}) has a publicly known vulnerability.',
					{
						components: {
							themeSlug: (
								<span className="activity-log__threat-alert-slug">{ extension.slug }</span>
							),
							version: (
								<span className="activity-log__threat-alert-version">{ extension.version }</span>
							),
						},
					}
				);

			case 'database':
				return translate(
					'Jetpack identified %(threatCount)d threat in your database.',
					'Jetpack identified %(threatCount)d threats in your database.',
					{
						count: Object.keys( threat.rows ).length,
						args: {
							threatCount: Object.keys( threat.rows ).length,
						},
					}
				);

			case 'none':
			default:
				return translate( 'Threat found' );
		}
	}

	renderSubtitle() {
		const { threat, translate } = this.props;

		switch ( this.getDetailType( threat ) ) {
			case 'core':
				return translate( 'Vulnerability found in WordPress' );

			case 'file':
				return translate( 'Threat found ({{signature/}})', {
					components: {
						signature: (
							<span className="activity-log__threat-alert-signature">{ threat.signature }</span>
						),
					},
				} );

			case 'plugin':
				return translate( 'Vulnerability found in plugin' );

			case 'theme':
				return translate( 'Vulnerability found in theme' );

			case 'database':
				return null;

			case 'none':
			default:
				return translate( 'Miscellaneous vulnerability' );
		}
	}

	getGroupedThreatRows() {
		const {
			threat: { rows },
			siteSlug,
		} = this.props;
		const infectedPosts = [];

		if ( ! rows ) {
			return [];
		}

		function findObjectIndexInArray( array, attr, value ) {
			for ( let i = 0; i < array.length; i++ ) {
				if ( array[ i ][ attr ] === value ) {
					return i;
				}
			}
			return -1;
		}

		Object.keys( rows ).map( ( idx ) => {
			const row = rows[ idx ];
			const postIndex = findObjectIndexInArray( infectedPosts, 'postTitle', row.description );

			if ( -1 === postIndex ) {
				infectedPosts.push( {
					postTitle: row.description,
					editUrl: `/post/${ siteSlug }/${ row.id }`,
					ids: [ parseInt( row.id ) ],
					minId: parseInt( row.id ),
					links: [ row.url ],
				} );
			} else {
				infectedPosts[ postIndex ].ids.push( parseInt( row.id ) );
				infectedPosts[ postIndex ].links.push( row.url );
				const minId = Math.min.apply( null, infectedPosts[ postIndex ].ids );
				infectedPosts[ postIndex ].minId = minId;
				infectedPosts[ postIndex ].editUrl = `/post/${ siteSlug }/${ minId }`;
			}
		} );

		return infectedPosts;
	}

	renderCardContent() {
		const { threat, translate } = this.props;

		const infectedPosts = this.getGroupedThreatRows();

		switch ( this.getDetailType( threat ) ) {
			case 'database':
				return (
					<Fragment>
						{ infectedPosts.map( ( infectedPost, postKey ) => (
							<Card key={ postKey } className="threat-alert__database-row">
								<div className="threat-alert__database-row-icon">
									<ActivityIcon activityIcon="posts" activityStatus="error" />
								</div>
								<div className="threat-alert__database-row-content">
									<div>
										<strong>{ infectedPost.postTitle }</strong>
									</div>
									<div>
										<em>
											{ this.props.translate(
												'%(urlCount)d suspicious link on post',
												'%(urlCount)d suspicious links on post',
												{
													count: infectedPost.links.length,
													args: {
														urlCount: infectedPost.links.length,
													},
												}
											) }
										</em>
										<div className="threat-alert__database-row-info">
											<InfoPopover>
												{ translate(
													'This link is included in post ID %(postId)d and %(revCount)d associated revision.',
													'This link is included in post ID %(postId)d and %(revCount)d associated revisions.',
													{
														count: infectedPost.links.length - 1,
														args: {
															postId: infectedPost.minId,
															revCount: infectedPost.links.length - 1,
														},
													}
												) }
											</InfoPopover>
										</div>
									</div>
									<ol className="threat-alert__database-row-list">
										{ infectedPost.links.map( ( link, linkKey ) => (
											<li key={ linkKey }>{ link }</li>
										) ) }
									</ol>
								</div>
								<Button
									className="threat-alert__database-row-action"
									compact
									href={ infectedPost.editUrl }
								>
									{ translate( 'Edit post' ) }
								</Button>
							</Card>
						) ) }
					</Fragment>
				);
			default:
				return (
					<Fragment>
						<p className="activity-log__threat-alert-description">{ threat.description }</p>
						{ threat.filename ? (
							<Fragment>
								<p>
									{ translate( 'Threat {{threatSignature/}} found in file:', {
										comment:
											'filename follows in separate line; e.g. "PHP.Injection.5 in: `post.php`"',
										components: {
											threatSignature: (
												<span className="activity-log__threat-alert-signature">
													{ threat.signature }
												</span>
											),
										},
									} ) }
								</p>
								<pre className="activity-log__threat-alert-filename">{ threat.filename }</pre>
							</Fragment>
						) : (
							<p className="activity-log__threat-alert-signature">{ threat.signature }</p>
						) }
						{ threat.context && <MarkedLines context={ threat.context } /> }
						{ threat.diff && <DiffViewer diff={ threat.diff } /> }
					</Fragment>
				);
		}
	}

	render() {
		const { threat, translate } = this.props;
		const inProgress = this.state.requesting || threat.fixer_status === 'in_progress';
		const className = classNames( {
			'activity-log__threat-alert': true,
			'activity-log__threat-alert-database': 'database' === this.getDetailType(),
		} );

		return (
			<Fragment>
				<FoldableCard
					className={ className }
					compact
					clickableHeader={ true }
					actionButton={ <span /> }
					header={
						<Fragment>
							<ActivityIcon activityIcon="notice-outline" activityStatus="error" />
							<div className="activity-log__threat-alert-header">
								<div className="activity-log__threat-header-top">
									<span className="activity-log__threat-alert-title">
										{ this.renderTitle() }
										<TimeSince
											className="activity-log__threat-alert-time-since"
											date={ threat.first_detected }
											dateFormat="ll"
										/>
									</span>
									{ inProgress && <Spinner /> }
									{ inProgress && (
										<Interval onTick={ this.refreshRewindState } period={ EVERY_TEN_SECONDS } />
									) }
									<SplitButton
										compact
										primary
										label={ threat.fixable ? translate( 'Fix threat' ) : translate( 'Get help' ) }
										onClick={ threat.fixable ? this.handleFix : this.handleGetHelp }
										disabled={ inProgress }
									>
										{ threat.fixable && (
											<PopoverMenuItem
												onClick={ this.handleGetHelp }
												className="activity-log__threat-menu-item"
												icon="chat"
											>
												<span>{ translate( 'Get help' ) }</span>
											</PopoverMenuItem>
										) }
										<PopoverMenuItem
											onClick={ this.handleIgnore }
											className="activity-log__threat-menu-item"
											icon="trash"
										>
											<span>{ translate( 'Ignore threat' ) }</span>
										</PopoverMenuItem>
									</SplitButton>
								</div>
								<span className="activity-log__threat-alert-type">{ this.renderSubtitle() }</span>
							</div>
						</Fragment>
					}
				>
					{ this.renderCardContent() }
				</FoldableCard>
			</Fragment>
		);
	}
}

const mapStateToProps = ( state ) => ( {
	siteSlug: getSelectedSiteSlug( state ),
} );

export default connect( mapStateToProps, {
	fixThreat: ( siteId, threatId ) =>
		withAnalytics(
			recordTracksEvent( 'calypso_activitylog_threat_fix', { threat_id: threatId } ),
			fixThreatAlert( siteId, threatId )
		),
	ignoreThreat: ( siteId, threatId ) =>
		withAnalytics(
			recordTracksEvent( 'calypso_activitylog_threat_ignore', { threat_id: threatId } ),
			ignoreThreatAlert( siteId, threatId )
		),
	trackGetHelp: ( threatId ) =>
		recordTracksEvent( 'calypso_activitylog_threat_gethelp', { threat_id: threatId } ),
	requestRewindState,
} )( localize( ThreatAlert ) );
