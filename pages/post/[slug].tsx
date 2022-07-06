import { GetStaticProps } from 'next'
import Header from '../../components/Header'
import { sanityClient, urlFor } from '../../sanity'
import { Post } from '../../typing'
import { PortableText } from '@portabletext/react'
import { useForm } from 'react-hook-form'
interface Props {
  post: Post
}
interface iFrom {
  id: string
  name: string
  email: string
  comment: string
}
const Post = ({ post }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<iFrom>()
  return (
    <main>
      <Header />
      <img
        src={urlFor(post.mainImage).url()!}
        className="h-40 w-full object-cover"
        alt=""
      />
      <article className="mx-auto max-w-3xl p-5">
        <h1 className="mt-10 mb-3 text-3xl ">{post.title}</h1>
        <p className="text text-xl font-light text-gray-500">
          {post.description}
        </p>
        <div className="flex items-center space-x-4">
          <img
            src={urlFor(post.author.image)?.url()}
            className="h-10 w-10 rounded-full"
            alt=""
          />
          <p className="text-sm font-extralight">
            Blog Post By {post.author.name} - Published At:{' '}
            {new Date(post._createdAt).toLocaleString()}
          </p>
        </div>
        <div className="my-4">
          <PortableText
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
            value={post.body}
            serializers={{
              h1: (props: any) => (
                <h1 className="my-5 text-2xl font-bold">{props}</h1>
              ),
              h2: (props: any) => (
                <h2 className="my-5 text-xl font-bold">{props}</h2>
              ),
              li: ({ children }: any) => (
                <h1 className="ml-4 list-disc">{children}</h1>
              ),
              link: ({ href, children }: any) => (
                <a className="text-blue-500 hover:underline" href={href}>
                  {children}
                </a>
              ),
            }}
          />
        </div>
      </article>
      <hr className="mx-auto my-5 max-w-lg border border-yellow-500" />
      <form>
        <input
          {...register('_id')}
          type={'hidden'}
          name="_id"
          value={post._id}
        />
        <label htmlFor="">
          <span>Name</span>
          <input
            {...register('name', { required: true })}
            type="text"
            placeholder="Meer fucking habib"
          />
        </label>
        <label htmlFor="">
          <span>Email</span>
          <input
            {...register('email', { required: true })}
            type="email"
            placeholder="Meer fucking habib"
          />
        </label>
        <label htmlFor="">
          <span>Comment</span>
          <textarea
            {...register('comment', { required: true })}
            rows={8}
            placeholder="Meer fucking habib"
          />
        </label>
      </form>
      <div></div>
    </main>
  )
}

export default Post

export const getStaticPaths = async () => {
  const query = `*[_type == 'post']{
  _id,
slug {
  current
}
}
`
  const posts = await sanityClient.fetch(query)
  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }))
  return {
    paths,
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type == 'post' && slug.current == $slug][0]{
  _id,
  title,
  author -> {
  name,
  image
},
'comments': *[
    _type == 'comment' && post._ref == ^._id && approved == true
],
mainImage,
description,
slug,
body
}`
  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  })
  if (!post) {
    return {
      notFound: true,
    }
  }
  return {
    props: {
      post,
    },
    revalidate: 60,
  }
}
