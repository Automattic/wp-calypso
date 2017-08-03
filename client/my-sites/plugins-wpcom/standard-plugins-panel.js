/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import {
	flowRight as compose,
	identity,
} from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import SectionHeader from 'components/section-header';
import Button from 'components/button';
import { recordTracksEvent } from 'state/analytics/actions';
import Plugin from './plugin';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

export const StandardPluginsPanel = ( {
	displayCount,
	onClick,
	plugins = [],
	translate = identity,
} ) => (
	<div>
		<SectionHeader label={ translate( 'Standard Plugins' ) }>
			<Button className="is-active-plugin" compact borderless>
				<Gridicon icon="checkmark" />{ translate( 'Active' ) }
			</Button>
		</SectionHeader>
		<CompactCard className="wpcom-plugins__standard-panel">
			<div className="wpcom-plugins__list">
				{ plugins
					.slice( 0, displayCount )
					.map( ( { name, descriptionLink, icon, category, description } ) => (
						<Plugin
							{ ...{
								category,
								description,
								descriptionLink,
								icon,
								key: name,
								name,
								onClick,
							} }
						/>
					)
				) }
			</div>
		</CompactCard>
		<Notice
			status="is-info"
			showDismiss={ false }
			text={ translate(
				'Uploading your own plugins is ' +
				'not available on WordPress.com.'
			) }
		>
			<NoticeAction
				href="https://en.support.wordpress.com/plugins/"
				external={ true }
			>
				{ translate( 'Learn More' ) }
			</NoticeAction>
		</Notice>
	</div>
);

StandardPluginsPanel.propTypes = {
	displayCount: PropTypes.number,
	plugins: PropTypes.array,
};

const trackClick = name =>
	recordTracksEvent( 'calypso_plugin_wpcom_click', {
		plugin_name: name,
		plugin_plan: 'standard',
	} );

const mapDispatchToProps = dispatch => ( {
	onClick: compose( dispatch, trackClick ),
} );

export default connect( null, mapDispatchToProps )( localize( StandardPluginsPanel ) );
