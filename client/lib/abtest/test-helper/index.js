/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/click-events-have-key-events */

/**
 * External dependencies
 */

import ReactDom from 'react-dom';
import React from 'react';
import Debug from 'debug';
import classNames from 'classnames';
/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { getAllTests, saveABTestVariation } from 'lib/abtest';

/**
 * Style dependencies
 */
import './style.scss';

const debug = Debug( 'calypso:abtests:helper' );

class Test extends React.Component {
	static displayName = 'Test';

	changeVariant = ( variation ) => {
		this.props.onChangeVariant( this.props.test, variation );
	};

	render() {
		const currentVariation = this.props.test.getVariation();
		return (
			<div>
				<h5 className="test-helper__test-header">{ this.props.test.name }</h5>
				<ul className="test-helper__list">
					{ this.props.test.variationNames.map( ( variation ) => (
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
									readOnly
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

const TestList = ( { tests, onChangeVariant } ) => (
	<div>
		<a href={ '/devdocs/client/lib/abtest/README.md' } title="ABTests">
			ABTests
		</a>
		<Card className="test-helper__active-tests">
			{ tests.map( ( test ) => (
				<Test key={ test.name } test={ test } onChangeVariant={ onChangeVariant } />
			) ) }
		</Card>
	</div>
);

export default function injectTestHelper( element ) {
	ReactDom.render(
		React.createElement( TestList, {
			tests: getAllTests(),
			onChangeVariant: function ( test, variation ) {
				debug( 'Switching test variant', test.experimentId, variation );
				saveABTestVariation( test.name, variation );
				window.location.reload();
			},
		} ),
		element
	);
}
