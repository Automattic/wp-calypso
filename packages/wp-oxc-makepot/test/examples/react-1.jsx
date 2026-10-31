class Component extends React.Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { translate } = this.props;

		return (
			<div title={ translate( 'Prop string' ) }>
				{
					// translators: Extract from leading
					translate( 'Child string', 'Child string plural', {
						context: 'react',
					} )
				}
			</div>
		);
	}
}

export default localize( Component );
