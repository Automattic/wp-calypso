/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Table from 'woocommerce/components/table';
import Row from 'woocommerce/components/table/table-row';
import Gridicon from 'gridicons';

const Example = () => {
	const titles = [ 'Title', '', 'Qty', 'Total' ];
	const link = <a href="#">An internal Link!</a>;
	const externalLink = (
		<a href="#">
			<Gridicon icon="external" size={ 18 } />
		</a>
	);
	const placeholder = '';
	const values = [
		[ 'one', placeholder, <a href="#">222</a>, 45 ],
		[ 'really really really really really really long name', placeholder, 55, 777 ],
		[ 'three', externalLink, <div>9</div>, 45 ],
		[ link, externalLink, <Gridicon icon="cog" size={ 18 } />, 8 ],
	];

	return (
		<div>
			<Table values={ titles }>
				{ values.map( v => (
					<Row key={ v } values={ v }/>
				) ) }
			</Table>
			<div style={ { width: '50%' } }>
				<Table values={ titles }>
					{ values.map( v => (
						<Row key={ v } values={ v }/>
					) ) }
				</Table>
			</div>
			<div style={ { width: '33%' } }>
				<Table values={ titles }>
					{ values.map( v => (
						<Row key={ v } values={ v }/>
					) ) }
				</Table>
			</div>
		</div>
	);
};

export default Example;
