'use client'

import React, { useState } from 'react'
import FormSection from '../_components/FormSection'
import OutputSection from '../_components/OutputSection'
import { TEMPLATE } from '../../_components/TemplateListSection'
import Templates from '@/app/(data)/Templates'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { chatSession } from '@/utils/AIModal'
import { db } from '@/utils/db'
import { AIOutput } from '@/utils/schema'
import { useUser } from '@clerk/nextjs'
import moment from 'moment'

interface PROPS{
    params:{
        'template-slug':string
    }
}

const CreatNewContent = (props:PROPS) => {
    {/* @ts-ignore */}
    const selectedTemplate:TEMPLATE|undefined=Templates?.find((item)=>item.slug==props.params['template-slug'])
    const [loading,setLoading]=useState(false)
    const [aiOutput,setAiOutput] = useState<string>('');
    const {user}=useUser()

    const GenerateAIcontent=async(formData:any)=>{
      setLoading(true);
      const SelectedPrompt=selectedTemplate?.aiPrompt;

      const FinalAIPrompt=SelectedPrompt+', '+JSON.stringify(formData);

      const result = await chatSession.sendMessage(FinalAIPrompt)
      console.log(result.response.text())
      console.log(result.response)
      setAiOutput(result.response.text())
      await SaveInDb(formData,selectedTemplate?.slug,result.response.text())
      setLoading(false)
    }
    const SaveInDb=async(formData:any,slug:any,aiOutput:string)=>{
      const result= await db.insert(AIOutput).values({
        formData:formData,
        templateSlug:slug,
        aiResponse:aiOutput,
        createdBy:user?.primaryEmailAddress?.emailAddress,
        createdAt:moment().format('DD/MM/yyyy')
      });
      console.log(result)
    }
    return (
    <div className='p-5'>
      <Link href={'/dashboard'}>
      <Button className='bg-transparent text- hover:bg-transparent'><ArrowLeft /></Button>
      </Link>
    <div className='grid grid-cols-1 md:grid-cols-3 gap-5 p-5'>
        <FormSection selectedTemplate={selectedTemplate}
        userFormInput={(v:any)=>GenerateAIcontent(v)}
        loading={loading} />
        <div className='col-span-2'>
        <OutputSection aiOutput={aiOutput} />
        </div>
    </div>
    </div>
  )
}

export default CreatNewContent