import { Button, Gridicon } from '@automattic/components';
import { Component } from 'react';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import Table from '..';
import TableItem from '../table-item';
import TableRow from '../table-row';

class Example extends Component {
	state = {
		hasBorder: false,
		isCompact: false,
	};

	onToggleCompact = () => {
		this.setState( { isCompact: ! this.state.isCompact } );
	};

	render() {
		const titles = (
			<TableRow isHeader>
				{ [ 'Title', '', 'Qty', 'Total' ].map( ( item, i ) => (
					<TableItem isHeader key={ i } isTitle={ 0 === i }>
						{ item }
					</TableItem>
				) ) }
			</TableRow>
		);
		// eslint-disable-next-line jsx-a11y/anchor-is-valid
		const link = <a href="#">An internal Link!</a>;
		const externalLink = (
			// eslint-disable-next-line jsx-a11y/anchor-is-valid
			<a href="#">
				<Gridicon icon="external" size={ 18 } />
			</a>
		);
		const placeholder = '';
		const values = [
			// eslint-disable-next-line jsx-a11y/anchor-is-valid
			[ 'one', placeholder, <a href="#">222</a>, 45 ],
			[ 'really really really really really really long name', placeholder, 55, 777 ],
			[ 'three', externalLink, <div>9</div>, 45 ],
			[ link, externalLink, <Gridicon icon="cog" size={ 18 } />, 8 ],
		];
		const middleColValues = [
			[ <FormInputCheckbox />, 'Thing 1', 65 ],
			[ <FormInputCheckbox />, 'Thing 2', 66 ],
			[ <FormInputCheckbox />, 'Thing 3', 67 ],
			[ <FormInputCheckbox />, 'Thing 4', <Gridicon icon="cog" size={ 18 } /> ],
		];
		const middleColTitles = (
			<TableRow isHeader>
				{ [ <FormInputCheckbox />, 'Description', 'Total' ].map( ( item, i ) => (
					<TableItem isHeader key={ i } isTitle={ 1 === i } alignRight={ 2 === i }>
						{ item }
					</TableItem>
				) ) }
			</TableRow>
		);

		return (
			<div className="woocommerce">
				<div className="docs__design-toggle">
					<Button onClick={ this.onToggleCompact }>
						{ this.state.isCompact ? 'Expanded' : 'Compact' }
					</Button>
				</div>
				<Table header={ titles } compact={ this.state.isCompact }>
					{ values.map( ( row, i ) => (
						<TableRow key={ i }>
							{ row.map( ( item, j ) => (
								<TableItem key={ j } isTitle={ 0 === j }>
									{ item }
								</TableItem>
							) ) }
						</TableRow>
					) ) }
				</Table>
				<Table header={ middleColTitles } compact={ this.state.isCompact }>
					{ middleColValues.map( ( row, i ) => (
						<TableRow key={ i }>
							{ row.map( ( item, j ) => (
								<TableItem
									key={ j }
									isRowHeader={ 1 === j }
									isTitle={ 1 === j }
									alignRight={ 2 === j }
								>
									{ item }
								</TableItem>
							) ) }
						</TableRow>
					) ) }
				</Table>
				<div style={ { width: '50%' } }>
					<Table header={ titles } compact={ this.state.isCompact }>
						{ values.map( ( row, i ) => (
							<TableRow key={ i }>
								{ row.map( ( item, j ) => (
									<TableItem key={ j } isRowHeader={ 0 === j } isTitle={ 0 === j }>
										{ item }
									</TableItem>
								) ) }
							</TableRow>
						) ) }
					</Table>
				</div>
				<div style={ { width: '33%' } }>
					<Table header={ titles } compact={ this.state.isCompact }>
						{ values.map( ( row, i ) => (
							<TableRow key={ i }>
								{ row.map( ( item, j ) => (
									<TableItem key={ j } isTitle={ 0 === j }>
										{ item }
									</TableItem>
								) ) }
							</TableRow>
						) ) }
					</Table>
				</div>
			</div>
		);
	}
}

Example.displayName = 'WooTable';

export default Example;
