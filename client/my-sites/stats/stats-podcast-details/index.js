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
import Card from 'components/card';

export class StatsModulePodcastDetails extends React.Component {

	data( nextProps ) {
		const props = nextProps || this.props;

		return props.summaryList.data;
	}

	render() {
		const isLoading = this.props.summaryList.isLoading(),
			classes = classNames( [
				'stats-module',
				'is-expanded',
				'summary',
				'is-video-details',
				{
					'is-loading': isLoading,
					'is-showing-info': this.state.showInfo,
					'has-no-data': this.props.summaryList.isEmpty()
				}
			] );
		return (
			<Card className={ classes }>
				<div className="videoplays">
					<div className="module-header">
						<h4 className="module-header-title">{ this.translate( 'Video Embeds' ) }</h4>
					</div>
					<div className="module-content">
						<StatsListLegend label={ this.translate( 'Page' ) } />
						<StatsModulePlaceholder isLoading={ isLoading } />
						<StatsList moduleName="Video Details"
							data={ this.props.summaryList.response.pages ? this.props.summaryList.response.pages : [] } />
					</div>
				</div>
			</Card>
		);
	}
}
