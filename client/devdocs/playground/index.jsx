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
import Gridicon from 'components/gridicon';
import Notice from 'components/notice';

const component = {
	accordion: require( 'raw!./../../components/accordion/docs/example.txt' ),
	button: require( 'raw!./../../components/button/docs/example.txt' ),
	gridicon: require( 'raw!./../../components/gridicon/docs/example.txt' ),
	notice: require( 'raw!./../../components/notice/docs/example.txt' )
};

const docClass = {
	notice: Notice,
	button: Button,
	accordion: Accordion,
	gridicon: Gridicon,
};

const DesignPlayGround = React.createClass( {
	displayName: 'DesignPlayGround',

	render() {
		return (
			<Main>
				<Playground
					codeText={ component[ this.props.component ] }
					docClass={ docClass[ this.props.component ] }
					theme="material"
					scope={ {
						React: React,
						Accordion: Accordion,
						Button: Button,
						Gridicon: Gridicon,
						Notice: Notice
					} }
					noRender={ true } />
			</Main>
		);
	}
} );

export default DesignPlayGround;
