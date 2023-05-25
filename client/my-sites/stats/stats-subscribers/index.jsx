import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import { mockData } from 'calypso/state/stats/mock-data/mockData';

const mapStateToProps = () => ( {
	mockData,
} );

class StatsSubscribers extends Component {
	static displayName = 'StatsSubscribers';

	render() {
		if ( ! this.props.mockData ) {
			return <p>there is a problem with the data</p>;
		}

		return (
			<p>
				{ this.props.mockData.items.map( ( item ) => (
					<div key={ item.date }>
						<table>
							<thead>
								<tr>
									{ item.fields.map( ( field ) => (
										<th key={ field }>{ field }</th>
									) ) }
								</tr>
							</thead>
							<tbody>
								{ item.data.map( ( dataRow, i ) => (
									<tr key={ i }>
										{ dataRow.map( ( dataCell, j ) => (
											<td key={ `${ i }-${ j }` }>{ dataCell }</td>
										) ) }
									</tr>
								) ) }
							</tbody>
						</table>
					</div>
				) ) }
			</p>
		);
	}
}

export default localize( connect( mapStateToProps )( StatsSubscribers ) );
