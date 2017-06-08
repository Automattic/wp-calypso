/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Table from 'woocommerce/components/table';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';
import Gridicon from 'gridicons';

class Example extends Component {
	state = {
		hasBorder: false,
		isCompact: false,
	};

	onToggleCompact = () => {
		this.setState( { isCompact: ! this.state.isCompact } );
	}

	onToggleBorder = () => {
		this.setState( { hasBorder: ! this.state.hasBorder } );
	}

	render() {
		const titles = (
			<TableRow isHeader>
				{ [ 'Title', '', 'Qty', 'Total' ].map( ( item, i ) => <TableItem isHeader isTitle={ 0 == i }>{ item }</TableItem> ) }
			</TableRow>
		);
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
			<div className="woocommerce">
				<div className="docs__design-toggle">
					<Button onClick={ this.onToggleCompact }>
						{ this.state.isCompact ? 'Expanded' : 'Compact' }
					</Button>
					<Button onClick={ this.onToggleBorder }>
						{ this.state.hasBorder ? 'Remove Border' : 'Add Border' }
					</Button>
				</div>
				<Table header={ titles } hasBorder={ this.state.hasBorder } compact={ this.state.isCompact }>
					{ values.map( ( row, i ) => (
						<TableRow key={ i }>
							{ row.map( ( item, j ) => (
								<TableItem key={ j } isTitle={ 0 == j }>{ item }</TableItem>
							) ) }
						</TableRow>
					) ) }
				</Table>
				<div style={ { width: '50%' } }>
					<Table header={ titles } hasBorder={ this.state.hasBorder } compact={ this.state.isCompact }>
						{ values.map( ( row, i ) => (
							<TableRow key={ i }>
								{ row.map( ( item, j ) => (
									<TableItem key={ j } isTitle={ 0 == j }>{ item }</TableItem>
								) ) }
							</TableRow>
						) ) }
					</Table>
				</div>
				<div style={ { width: '33%' } }>
					<Table header={ titles } hasBorder={ this.state.hasBorder } compact={ this.state.isCompact }>
						{ values.map( ( row, i ) => (
							<TableRow key={ i }>
								{ row.map( ( item, j ) => (
									<TableItem key={ j } isTitle={ 0 == j }>{ item }</TableItem>
								) ) }
							</TableRow>
						) ) }
					</Table>
				</div>
			</div>
		);
	};
}

Example.displayName = 'WooTable';

export default Example;
