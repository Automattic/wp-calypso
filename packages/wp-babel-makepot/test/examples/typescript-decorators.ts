@DecoratorClass( 'example' )
class ExamlpeClass {
	@DecoratorMethod( 'example' )
	public async getItem( @DecoratorParam( 'example' ) id?: number ): string {
		return translate( 'Decorator Preset' );
	}
}
