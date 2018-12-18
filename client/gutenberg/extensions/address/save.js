const save = ( {
	attributes: { address, address_line2, address_line3, city, region, postal, country },
	className,
} ) => (
	<div
		className={ className }
		itemprop="address"
		itemscope
		itemtype="http://schema.org/PostalAddress"
	>
		{ address && <div itemprop="streetAddress">{ address }</div> }
		{ address_line2 && <div itemprop="streetAddress">{ address_line2 }</div> }
		{ address_line3 && <div itemprop="streetAddress">{ address_line3 }</div> }
		{ city && ! ( region || postal ) && <div itemprop="addressLocality">{ city }</div> }
		{ city &&
			( region || postal ) && (
				<div>
					{ [
						<span itemprop="addressLocality">{ city }</span>,
						', ',
						<span itemprop="addressRegion">{ region }</span>,
						<span itemprop="addressPostal">{ postal }</span>,
					] }
				</div>
			) }
		{ ! city &&
			( region || postal ) && (
				<div>
					{ [
						<span itemprop="addressRegion">{ region }</span>,
						<span itemprop="addressPostal">{ postal }</span>,
					] }
				</div>
			) }
		{ country && <div itemprop="addressCountry">{ country }</div> }
	</div>
);

export default save;
