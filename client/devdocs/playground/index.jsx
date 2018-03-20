/**
 * External dependencies
 */
import React from 'react';
import Playground from 'component-playground';

/**
 * Internal dependencies
 */
import Main from 'components/main';

import Accordion from 'components/accordion';
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import Card from 'components/card';
import Notice from 'components/notice';

const component = {
	accordion: require( 'raw-loader!./../../components/accordion/docs/example.txt' ),
	button: require( 'raw-loader!./../../components/button/docs/example.txt' ),
	'button-group': require( 'raw-loader!./../../components/button-group/docs/example.txt' ),
	card: require( 'raw-loader!./../../components/card/docs/example.txt' ),
	notice: require( 'raw-loader!./../../components/notice/docs/example.txt' ),
	none: require( 'raw-loader!./example.txt' ),
};

const docClass = {
	accordion: Accordion,
	button: Button,
	'button-group': ButtonGroup,
	card: Card,
	notice: Notice,
	none: null,
};

const DesignPlayGround = React.createClass( {
	displayName: 'DesignPlayGround',

	render() {
		const path = this.props.component ? this.props.component : 'none';
		return (
			<Main>
				<Playground
					codeText={ component[ path ] }
					docClass={ docClass[ path ] }
					theme="material"
					scope={ {
						React: React,
						Accordion: Accordion,
						Button: Button,
						ButtonGroup: ButtonGroup,
						Card: Card,
						Notice: Notice
					} }
					noRender={ true } />
			</Main>
		);
	}
} );

export default DesignPlayGround;
