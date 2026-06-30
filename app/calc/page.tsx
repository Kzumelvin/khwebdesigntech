import Calculator from "@/components/calc/calculator"

function page() {
  return (
    <section className="w-full h-full flex justify-center items-center p-7">
      <div className="w-1/2">
        <Calculator />
      </div>
    </section>
  )
}

export default page
