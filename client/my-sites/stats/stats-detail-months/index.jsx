/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import toggle from '../mixin-toggle';
import observe from 'lib/mixins/data-observe';
import Card from 'components/card';
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'StatsPostDetailMonths',

	propTypes: {
		postViewsList: PropTypes.object
	},

	mixins: [
		toggle( 'PostMonth' ),
		observe( 'postViewsList' )
	],

	getInitialState() {
		return {
			noData: this.props.postViewsList.isEmpty()
		};
	},

	componentWillReceiveProps( nextProps ) {
		this.setState( {
			noData: nextProps.postViewsList.isEmpty()
		} );
	},

	render() {
		const { title, total, dataKey, postViewsList } = this.props;
		const { showInfo, noData } = this.state;
		const data = postViewsList.response;
		const infoIcon = showInfo ? 'info' : 'info-outline';
		const classes = {
			'is-loading': this.props.postViewsList.isLoading(),
			'is-showing-info': showInfo,
			'has-no-data': noData
		};

		let tableHeader;
		let tableRows;
		let tableBody;
		let highest;

		if ( data && data[ dataKey ] ) {
			tableHeader = (
				<thead>
					<tr className="top">
						<th className="spacer">0000</th>
						<th>{ this.translate( 'Jan' ) }</th>
						<th>{ this.translate( 'Feb' ) }</th>
						<th>{ this.translate( 'Mar' ) }</th>
						<th>{ this.translate( 'Apr' ) }</th>
						<th>{ this.translate( 'May' ) }</th>
						<th>{ this.translate( 'Jun' ) }</th>
						<th>{ this.translate( 'Jul' ) }</th>
						<th>{ this.translate( 'Aug' ) }</th>
						<th>{ this.translate( 'Sep' ) }</th>
						<th>{ this.translate( 'Oct' ) }</th>
						<th>{ this.translate( 'Nov' ) }</th>
						<th>{ this.translate( 'Dec' ) }</th>
						<th>{ total }</th>
					</tr>
				</thead>
			);

			highest = 'years' === dataKey ? data.highest_month : data.highest_day_average;

			tableRows = Object.keys( data[ dataKey ] ).map( function( i ) {
				const year = data[ dataKey ][ i ];
				const cells = [];

				cells.push( <th key={ 'header' + i }>{ i }</th> );

				for ( let j = 1; j <= 12; j++ ) {
					const hasData = ( year.months[ j ] || 0 === year.months[ j ] );

					const cellClass = classNames(
						{
							'highest-count': ( 0 !== highest ) && ( year.months[ j ] === highest ),
							'has-no-data': ! hasData
						}
					);

					if ( hasData ) {
						cells.push(
							<td className={ cellClass } key={ 'y' + i + 'm' + j }>
								<span className="value">{ this.numberFormat( year.months[ j ] ) }</span>
							</td> );
					} else {
						cells.push( <td className={ cellClass } key={ 'y' + i + 'm' + j }></td> );
					}
				}

				cells.push( <td key={ 'total' + i }>{ this.numberFormat( 'years' === dataKey ? year.total : year.overall ) }</td> );

				return ( <tr key={ i }>{ cells }</tr> );
			}, this );

			tableBody = ( <tbody>{ tableRows }</tbody> );
		}

		return (
			<Card className={ classNames( 'stats-module', 'is-expanded', 'is-post-months', classes ) }>
				<div className="module-header">
					<h4 className="module-header-title">{ title }</h4>
					<ul className="module-header-actions">
						<li className="module-header-action toggle-info">
							<a
								href="#"
								className="module-header-action-link"
								aria-label={ this.translate( 'Show or hide panel information', { context: 'Stats panel action' } ) }
								title={ this.translate( 'Show or hide panel information', { context: 'Stats panel action' } ) }
								onClick={ this.toggleInfo } >

								{ infoIcon ? <Gridicon icon={ infoIcon } /> : null }
							</a>
						</li>
					</ul>
				</div>
				<div className="module-content">
					<div className="module-content-text module-content-text-info">
						<p className="message">
							{ this.translate( 'No views yet', { context: 'Empty info box title for post stats page in Stats' } ) }
						</p>
						<p>
							{ this.translate( 'This panel gives you an overview of how many views your website gets on average.', { context: 'Info box description for post stats page in Stats' } ) }
						</p>
						<p className="legend achievement">{
							this.translate(
								'%(value)s = The all-time highest value.',
								{ args:
									{ value: ( this.numberFormat( highest ) ) },
									context: 'Legend for post stats page in Stats'
								}
							)
						}</p>
					</div>
					<div className="module-placeholder is-void"></div>
					<div className="module-content-table">
						<div className="module-content-table-scroll">
							<table cellPadding="0" cellSpacing="0">
								{ tableHeader }
								{ tableBody }
							</table>
						</div>
					</div>
				</div>
			</Card>
		);
	}
} );
