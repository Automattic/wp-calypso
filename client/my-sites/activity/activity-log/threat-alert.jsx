/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import ActivityIcon from '../activity-log-item/activity-icon';
import DiffViewer from 'components/diff-viewer';
import FoldableCard from 'components/foldable-card';
import MarkedLines from 'components/marked-lines';
import TimeSince from 'components/time-since';
import PopoverMenuItem from 'components/popover/menu-item';
import SplitButton from 'components/split-button';

/**
 * Style dependencies
 */
import './threat-alert.scss';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:activity-log' );

const detailType = threat => {
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

	return 'none';
};

const headerTitle = ( translate, threat ) => {
	const { extension, filename } = threat;
	const basename = s => s.replace( /.*\//, '' );

	switch ( detailType( threat ) ) {
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
						pluginSlug: <span className="activity-log__threat-alert-slug">{ extension.slug }</span>,
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
						themeSlug: <span className="activity-log__threat-alert-slug">{ extension.slug }</span>,
						version: (
							<span className="activity-log__threat-alert-version">{ extension.version }</span>
						),
					},
				}
			);

		case 'none':
		default:
			return translate( 'Threat found' );
	}
};

const headerSubtitle = ( translate, threat ) => {
	switch ( detailType( threat ) ) {
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

		case 'none':
		default:
			return translate( 'Miscellaneous vulnerability' );
	}
};

export class ThreatAlert extends Component {
	render() {
		const { threat, translate } = this.props;

		return (
			<Fragment>
				<FoldableCard
					className="activity-log__threat-alert"
					highlight="error"
					compact
					clickableHeader={ true }
					actionButton={ <span /> }
					header={
						<Fragment>
							<ActivityIcon activityIcon="notice-outline" activityStatus="error" />
							<div className="activity-log__threat-alert-header">
								<div className="activity-log__threat-header-top">
									<span className="activity-log__threat-alert-title">
										{ headerTitle( translate, threat ) }
										<TimeSince
											className="activity-log__threat-alert-time-since"
											date={ threat.firstDetected }
											dateFormat="ll"
										/>
									</span>
									<SplitButton
										compact
										primary
										label={ translate( 'Fix threat' ) }
										onClick={ () => debug( 'main button clicked' ) }
										disabled={ false }
									>
										<PopoverMenuItem
											onClick={ () => debug( 'documentation clicked' ) }
											className="activity-log__threat-menu-item"
											icon="help"
										>
											<span>{ translate( 'Documentation' ) }</span>
										</PopoverMenuItem>
										<PopoverMenuItem
											onClick={ () => debug( 'get help clicked' ) }
											className="activity-log__threat-menu-item"
											icon="chat"
										>
											<span>{ translate( 'Get help' ) }</span>
										</PopoverMenuItem>
										<PopoverMenuItem
											onClick={ () => debug( 'ignore threat clicked' ) }
											className="activity-log__threat-menu-item"
											icon="trash"
										>
											<span>{ translate( 'Ignore threat' ) }</span>
										</PopoverMenuItem>
									</SplitButton>
								</div>
								<span className="activity-log__threat-alert-type">
									{ headerSubtitle( translate, threat ) }
								</span>
							</div>
						</Fragment>
					}
				>
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
				</FoldableCard>
			</Fragment>
		);
	}
}

export default localize( ThreatAlert );
