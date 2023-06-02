const Component = ( props ) => {
	const { __, _nx } = useI18n();

	return (
		<div title={ __( 'Prop string' ) }>
			{
				// translators: Extract from leading
				_nx( 'Child string', 'Child string plural', null, 'react' )
			}
		</div>
	);
};

export default Component;
