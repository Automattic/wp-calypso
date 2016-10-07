import React from 'react';

export default class HelloDolly extends React.Component {
	lyrics = [
		`Hello, Dolly`,
		`Well, hello, Dolly`,
		`It's so nice to have you back where you belong`,
		`You're lookin' swell, Dolly`,
		`I can tell, Dolly`,
		`You're still glowin', you're still crowin'`,
		`You're still goin' strong`,
		`We feel the room swayin'`,
		`While the band's playin'`,
		`One of your old favourite songs from way back when`,
		`So, take her wrap, fellas`,
		`Find her an empty lap, fellas`,
		`Dolly'll never go away again`,
		`Hello, Dolly`,
		`Well, hello, Dolly`,
		`It's so nice to have you back where you belong`,
		`You're lookin' swell, Dolly`,
		`I can tell, Dolly`,
		`You're still glowin', you're still crowin'`,
		`You're still goin' strong`,
		`We feel the room swayin'`,
		`While the band's playin'`,
		`One of your old favourite songs from way back when`,
		`Golly, gee, fellas`,
		`Find her a vacant knee, fellas`,
		`Dolly'll never go away`,
		`Dolly'll never go away`,
		`Dolly'll never go away again`
	]

	constructor( props ) {
		super( props );
		this.state = { index: 0 };
	}

	componentDidMount() {
		setInterval( () => {
			const index = ++this.state.index;
			this.setState( { index: index === this.lyrics.length - 1 ? 0 : index } );
		}, 2000 );
	}

	render() {
		return <span>{ this.lyrics[ this.state.index ] }</span>;
	}
}
