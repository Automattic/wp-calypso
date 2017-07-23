# Overview

This document describes the REST API envisioned to support the full Share a Draft design as of July 23, 2017.

# Schema

## FeedbackRequest

| Name				| Type		| Description												|
| ----------------- | --------- | --------------------------------------------------------- |
| id				| uuid		| The feedback request ID. Read only. 						|
| link				| URL		| A URL to view and offer feedback on a draft.				|
| isEnabled			| boolean	| Indicates whether or not the share is enabled				|
| email				| string?	| Reviewer email address. Optional.							|
| last_view_date	| datetime	| The last time the author read feedback from this reviewer	|
| comments			| Comment[]	| An array of comments										|

## Comment

| Name		| Type		| Description					|
| --------- | --------- | ----------------------------- |
| timestamp	| datetime	| When the comment was added.	|						
| text		| string	| The comment text				|

# Endpoints

## List feedback requests

URI: `/sites/<site-id>/posts/<post-id>/feedback-requests`

Method: `GET`

### Response body

```json
[
	{
		"id": "42dd8eaf-c0cd-4cc5-a7ab-db31db0b7178",
		"link": "https://example.com?p=123&request-feedback=",
		"isEnabled": true,
		"email": "brandon@example.com",
		"last_view_date": 1500792094429,
		"comments": [
			{
				"timestamp": 1234567890,
				"text": "Heading in a great direction." 
			},
			{
				"timestamp": 234567890,
				"text": "Have you considered sending this to Amy?" 
			}
		]
	},
	{
		"id": "dee0325a-5f32-4c31-b8be-d8f4592dd22d",
		"link": "https://example.com?p=123&request-feedback=",
		"isEnabled": true,
		"email": "nikolay@example.com",
		"last_view_date": 1500792093123,
		"comments": [
			{
				"timestamp": 1234567450,
				"text": "This is solid but could use a few tweaks..." 
			}
		]
	}
]
```

## Create a feedback request

URI: `/sites/<site-id>/posts/<post-id>/feedback-requests`

Method: `POST`

### Request body

```json
{
	"email": "dennis@example.com"
}
```

### Response body

```json
{
	"id": "e83b9042-3c6c-4388-96d4-f043e6727da0",
	"link": "https://example.com?p=123&request-feedback=e83b9042-3c6c-4388-96d4-f043e6727da0",
	"isEnabled": true,
	"email": "dennis@example.com",
	"last_view_date": 0,
	"comments": []
}
```


## Update a feedback request

URI: `/sites/<site-id>/posts/<post-id>/feedback-requests/<id>`

Method: `PATCH`

### Request body

```json
{
	"isEnabled": false
}
```

### Response body

```json
{
	"id": "e83b9042-3c6c-4388-96d4-f043e6727da0",
	"link": "https://example.com?p=123&request-feedback=e83b9042-3c6c-4388-96d4-f043e6727da0",
	"isEnabled": false,
	"email": "dennis@example.com",
	"last_view_date": 0,
	"comments": []
}
```


## Create a feedback comment

URI: `/sites/<site-id>/posts/<post-id>/feedback-requests/<id>/comments`

Method: `POST`

### Request body

```json
"This is a wonderful comment."
```

### Response body

```json
{
	"timestamp": 1234567890,
	"text": "This is a wonderful comment."
}
```
