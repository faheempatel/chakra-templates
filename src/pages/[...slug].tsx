import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { Container, Stack, Box, Flex, Text, Heading } from '@chakra-ui/react';
import * as fs from 'fs';
import path from 'path';

import { DocsLayout } from '@/layout/DocsLayout';
import { Example } from '@/components/Example';
import { TEMPLATE_DIR } from '../constants';
import { data, Template, Category, SubCategory } from 'data';

type PageProps = {
  category: Category;
  subCategory: SubCategory;
  templates?: Template[];
  code?: Record<string, string>;
};

const Templates: NextPage<PageProps> = ({
  category,
  subCategory,
  templates,
  code,
}) => {
  return (
    <DocsLayout>
      <Heading size={'lg'} mb={6}>
        {subCategory.name}
      </Heading>
      <Stack spacing={12}>
        {templates?.map((template) => (
          <div>{template.name}</div>
          // <Example
          //   key={template.filename}
          //   template={template}
          //   category={category}
          //   subCategory={subCategory}
          //   code={code![template.filename]}
          // />
        ))}
      </Stack>
    </DocsLayout>
  );
};

export const getStaticProps: GetStaticProps<
  PageProps,
  { slug: string[] }
> = async ({ params }) => {
  const category = params!.slug[0];
  const subCategory = params!.slug[1];

  const categoryData = data.filter((c) => c.id === category)[0];
  const subCategoryData = categoryData.children!.filter(
    (s) => s.id === subCategory
  )[0];
  const templates = subCategoryData.children;

  const code = templates?.reduce((prev, curr) => {
    const filePath = path.join(
      process.cwd(),
      `${TEMPLATE_DIR}/${category}/${subCategory}`
    );
    const content = fs.readFileSync(
      `${filePath}/${curr.filename}.tsx`,
      'utf-8'
    );
    return {
      ...prev,
      [curr.filename]: content,
    };
  }, {});

  return {
    props: {
      category: categoryData,
      subCategory: subCategoryData,
      templates,
      code,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  // TODO get rid of ! operator and make more failsafe
  const paths = data
    .map((category) =>
      category
        .children!.map((subCategory) => ({
          params: {
            slug: [category.id, subCategory.id],
          },
        }))
        .flat()
    )
    .flat();

  return {
    paths: paths,
    fallback: false,
  };
};

export default Templates;
