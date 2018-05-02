/** @format */
import React from 'react';
import classNames from 'classnames';

export default class extends React.Component {
	static displayName = 'Test';

	changeVariant = variation => {
		this.props.onChangeVariant( this.props.test, variation );
	};

	render() {
		const currentVariation = this.props.test.getVariation();
		return (
			<div>
				<h5 className="test-helper__test-header">{ this.props.test.name }</h5>
				<ul className="test-helper__list">
					{ this.props.test.variationNames.map( variation => (
						<li onClick={ this.changeVariant.bind( this, variation ) } key={ variation }>
							<a
								className={ classNames( {
									'test-helper__variation': true,
									'test-helper__current-variation': variation === currentVariation,
								} ) }
							>
								<input
									className="test-helper__choice-indicator"
									type="radio"
									checked={ variation === currentVariation }
								/>
								{ variation }
							</a>
						</li>
					) ) }
				</ul>
			</div>
		);
	}
}
