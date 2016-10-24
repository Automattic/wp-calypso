/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import StatsList from '../stats-list';
import StatsListLegend from '../stats-list/legend';
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatsModuleHeader from '../stats-module/header';
import Card from 'components/card';

export default React.createClass( {
	displayName: 'StatModuleVideoDetails',

	render: function() {
		const isLoading = this.props.summaryList.isLoading();

		const classes = classNames(
			'stats-module',
			'is-expanded',
			'summary',
			{
				'is-loading': isLoading,
				'has-no-data': this.props.summaryList.isEmpty()
			}
		);

		return (
			<Card className={ classes }>
				<StatsModuleHeader title={ this.translate( 'Video Embeds' ) } showActions={ false } />
				<StatsListLegend label={ this.translate( 'Page' ) } />
				<StatsModulePlaceholder isLoading={ isLoading } />
				<StatsList
					moduleName="Video Details"
					data={ this.props.summaryList.response.pages ? this.props.summaryList.response.pages : [] }
				/>
			</Card>
		);
	}
} );
