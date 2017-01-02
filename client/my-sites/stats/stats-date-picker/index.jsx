/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { flowRight } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import userUtils from 'lib/user/utils';
import { getSelectedSiteSlug } from 'state/ui/selectors';

class StatsDatePicker extends Component {
	static propTypes = {
		date: PropTypes.oneOfType( [
			PropTypes.object.isRequired,
			PropTypes.string.isRequired
		] ),
		path: PropTypes.string,
		period: PropTypes.string.isRequired,
		slug: PropTypes.string,
		summary: PropTypes.bool,
	};

	dateForDisplay() {
		const { date, moment, period, translate } = this.props;
		const locale = userUtils.getLocaleSlug();
		const localizedDate = moment( date ).locale( locale );
		let formattedDate;

		switch ( period ) {
			case 'week':
				formattedDate = translate(
					'%(startDate)s - %(endDate)s',
					{
						context: 'Date range for which stats are being displayed',
						args: {
							// LL is a date localized by momentjs
							startDate: localizedDate.startOf( 'week' ).add( 1, 'd' ).format( 'LL' ),
							endDate: localizedDate.endOf( 'week' ).add( 1, 'd' ).format( 'LL' )
						}
					}
				);
				break;

			case 'month':
				formattedDate = localizedDate.format( 'MMMM YYYY' );
				break;

			case 'year':
				formattedDate = localizedDate.format( 'YYYY' );
				break;

			default:
				// LL is a date localized by momentjs
				formattedDate = localizedDate.format( 'LL' );
		}

		return formattedDate;
	}

	render() {
		const { date, moment, path, period, slug, summary, translate } = this.props;
		const showYesterdayLink = period === 'day' && moment( date ).isSame( moment(), 'day' );
		const pathUrlPart = path ? '/' + path : '';
		const yesteday = period === 'day' ? moment( date ).subtract( 1, 'days' ).format( 'YYYY-MM-DD' ) : null;
		const yesterdayLink = slug && showYesterdayLink
			? (
				<a
					className="stats-date-picker__yesterday"
					href={ `/stats/day${ pathUrlPart }/${ slug }?startDate=${ yesteday }` }
				>
					{ translate( '[ yesterday ]' ) }
				</a>
			)
			: null;

		const sectionTitle = translate( 'Stats for {{period/}} {{yesterday/}}', {
			components: {
				period: (
					<span className="period">
						<span className="date">{ this.dateForDisplay() }</span>
					</span>
				),
				yesterday: yesterdayLink
			},
			context: 'Stats: Main stats page heading',
			comment: 'Example: "Stats for December 7", "Stats for December 8 - December 14", "Stats for December", "Stats for 2014"'
		} );

		return (
			<div>
				{ summary
					? <span>{ sectionTitle }</span>
					: <h3 className="stats-section-title">{ sectionTitle }</h3>
				}
			</div>
		);
	}
}

const connectComponent = connect(
	state => {
		const slug = getSelectedSiteSlug( state );
		return {
			slug
		};
	}
);

export default flowRight(
	connectComponent,
	localize
)( StatsDatePicker );
