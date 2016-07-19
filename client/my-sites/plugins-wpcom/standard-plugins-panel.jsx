/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import SectionHeader from 'components/section-header';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import { recordTracksEvent } from 'state/analytics/actions';
import Plugin from './plugin';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

export const StandardPluginsPanel = React.createClass( {
	render() {
		const {
			displayCount,
			onClick,
			plugins = []
		} = this.props;

		const selectPlugin = name => () => onClick( name );
		const shownPlugins = plugins.slice( 0, displayCount );

		return (
			<div>
				<SectionHeader label={ this.translate( 'Standard Plugins' ) }>
					<Button className="is-active-plugin" compact borderless>
						<Gridicon icon="checkmark" />{ this.translate( 'Active' ) }
					</Button>
				</SectionHeader>
				<CompactCard className="wpcom-plugins__standard-panel">
					<div className="wpcom-plugins__list">
						{ shownPlugins.map( ( { name, descriptionLink, icon, category, description } ) =>
							<Plugin
								onClick={ () => onClick( name ) }
								{ ...{ name, key: name, descriptionLink, icon, category, description } }
							/>
						) }
					</div>
				</CompactCard>
				<Notice
					status="is-info"
					showDismiss={ false }
					text={ this.translate( 'Uploading your own plugins is not available on WordPress.com.' ) }
				>
					<NoticeAction href="https://en.support.wordpress.com/plugins/" external={ true }>
						{ this.translate( 'Learn More' ) }
					</NoticeAction>
				</Notice>
			</div>
		);
	}
} );

StandardPluginsPanel.propTypes = {
	displayCount: PropTypes.number,
	plugins: PropTypes.array
};

const trackClick = name => recordTracksEvent(
	'calypso_plugin_wpcom_click',
	{
		plugin_name: name,
		plugin_plan: 'standard'
	}
);

const mapDispatchToProps = dispatch => ( {
	onClick: name => dispatch( trackClick( name ) )
} );

export default connect( null, mapDispatchToProps )( localize( StandardPluginsPanel ) );
