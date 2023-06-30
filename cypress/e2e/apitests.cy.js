import post from '../fixtures/post.json';
import auth_user from '../fixtures/auth_user.json';
import {
	getPostFromResponse,
	comperePostsWithoutId,
	generatePosts,
} from '../support/helper.js';
import { faker } from '@faker-js/faker';

describe('Before run GENERATE POSTS', () => {});
before(() => {
	generatePosts(0);
});

describe('GET - Non-Auth suit', () => {
	it('1. Get all posts', () => {
		cy.request('GET', '/posts').then((response) => {
			cy.log(`Return all posts: ${JSON.stringify(response.body)}`);
			expect(response.status).to.be.equal(200);
		});
	});
	it('2. Get only first 10 posts.', () => {
		const num = 10;
		cy.request({
			method: 'GET',
			url: '/posts',
			qs: { _limit: num },
		}).then((response) => {
			cy.log(`Return first 10 posts: ${JSON.stringify(response.body)}`);
			let posts = response.body;
			for (let i = 0; i < response.body.length; i++) {
				if (posts[i].id > 0 && posts[i].id <= num) {
					cy.log(`Post IDs: ${posts[i].id}`);
				} else {
					throw `INVALID Post IDs: ${posts[i].id}`;
				}
			}
			expect(response.status).to.be.equal(200);
			expect(response.body.length).to.be.equal(num);
		});
	});
	it('3. Get posts with id = 55 and id = 60', () => {
		let ids = [55, 60];
		for (let i = 0; i < ids.length; i++) {
			cy.request('GET', `/posts/${ids[i]}`).then((response) => {
				cy.log(`ID = ${ids[i]} returns post: ${JSON.stringify(response.body)}`);
				expect(response.status).to.be.equal(200);
				expect(response.body.id).to.be.equal(ids[i]);
			});
		}
	});
	it.skip('qs 3. Get posts with id = 55 and id = 60', () => {
		let ids = [55, 60];

		cy.request({
			method: 'GET',
			url: '/posts',
			qs: { id: ids[0], id: ids[1] },
			// /posts?id=1&id=2
		}).then((response) => {
			console.log('body =>' + JSON.stringify(response.body));
			cy.log(`ID = ${ids} return posts: ${JSON.stringify(response.body)}`);
			expect(response.status).to.be.equal(200);

			for (let i = 0; i < response.body.length; i++) {
				console.log('resp =>' + response.body[i].id);
				console.log('ids =>' + ids[i]);
				expect(response.body[i].id).to.be.equal(ids[i]);
			}
		});
	});
});
describe('POST - Auth suit', () => {
	it('4. Create a post.', () => {
		cy.request({
			method: 'POST',
			url: '664/posts',
			body: post,
			failOnStatusCode: false,
		}).then((response) => {
			expect(response.status).to.be.equal(401);
		});
	});
	it('5. Create post with adding access token in header.', () => {
		post.title = auth_user.email;
		auth_user.email = faker.internet.email();

		cy.request({
			method: 'POST',
			url: '/register',
			body: auth_user,
		}).then((response) => {
			expect(response.status).to.be.equal(201);
			cy.request({
				method: 'POST',
				url: '664/posts',
				headers: { authorization: `Bearer ${response.body.accessToken}` },
				body: post,
			}).then((response) => {
				expect(response.status).to.be.equal(201);
				getPostFromResponse(response);
				comperePostsWithoutId(response, post);
			});
		});
	});
});

describe('POST - Non-Auth suit', () => {
	it('6. Create post entity and verify that the entity is created.', () => {
		cy.request({
			method: 'POST',
			url: '/posts',
			body: post,
		}).then((response) => {
			cy.log(`Return created post: ${JSON.stringify(response.body)}`);
			expect(response.status).to.be.equal(201);
			getPostFromResponse(response);
			comperePostsWithoutId(response, post);
		});
	});
	it('7. Update non-existing entity', () => {
		cy.request({
			method: 'PUT',
			url: '/posts/000',
			failOnStatusCode: false,
		}).then((response) => {
			expect(response.status).to.be.equal(404);
		});
	});
	it('8. Create post entity and update the created entity.', () => {
		let updPost = {
			userId: 2023,
			title: 'updated title 2023',
			body: 'updated body 2023',
		};
		cy.request({
			method: 'POST',
			url: '/posts',
			body: post,
		}).then((response) => {
			cy.log(`Return CREATED post: ${JSON.stringify(response.body)}`);
			expect(response.status).to.be.equal(201);
			getPostFromResponse(response);
			comperePostsWithoutId(response, post);

			cy.request({
				method: 'PUT',
				url: `/posts/${response.body.id}`,
				body: updPost,
			}).then((responseAfterUpd) => {
				cy.log(`Return UPDATED post: ${JSON.stringify(responseAfterUpd.body)}`);

				expect(responseAfterUpd.status).to.be.equal(200);
				getPostFromResponse(responseAfterUpd);
				comperePostsWithoutId(responseAfterUpd, updPost);
			});
		});
	});
	it('9. Delete non-existing post entity.', () => {
		cy.request({
			method: 'DELETE',
			url: '/posts/000',
			failOnStatusCode: false,
		}).then((response) => {
			expect(response.status).to.be.equal(404);
		});
	});
	it('10. Create post entity, update the created entity, and delete the entity.', () => {
		let updPost = {
			userId: 1234,
			title: '1234 CreateUpdateDelete TITLE',
			body: '1234 CreateUpdateDelete BODY',
		};

		cy.request({
			method: 'POST',
			url: '/posts',
			body: post,
		}).then((response) => {
			cy.log(`Return CREATED post: ${JSON.stringify(response.body)}`);
			expect(response.status).to.be.equal(201);
			getPostFromResponse(response);
			comperePostsWithoutId(response, post);

			cy.request({
				method: 'PUT',
				url: `/posts/${response.body.id}`,
				body: updPost,
			}).then((responseAfterUpd) => {
				cy.log(`Return UPDATED post: ${JSON.stringify(responseAfterUpd.body)}`);
				expect(responseAfterUpd.status).to.be.equal(200);
				getPostFromResponse(responseAfterUpd);
				comperePostsWithoutId(responseAfterUpd, updPost);
				let idBeforeDelete = responseAfterUpd.body.id;
				cy.request({
					method: 'DELETE',
					url: `/posts/${responseAfterUpd.body.id}`,
				}).then((responseAfterDelete) => {
					expect(responseAfterDelete.status).to.be.equal(200);

					cy.request({
						method: 'GET',
						url: `/posts/${idBeforeDelete}`,
						failOnStatusCode: false,
					}).then((response) => {
						expect(response.status).to.be.equal(404);
					});
				});
			});
		});
	});
});
